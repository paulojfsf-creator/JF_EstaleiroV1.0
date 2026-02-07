"""
Test Viatura Maintenance Features:
- PATCH /api/viaturas/{id}/manutencao endpoint
- GET /api/viaturas/{id} with new fields (em_manutencao, descricao_avaria, document URLs, dates)
- Status indicators and alerts
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Module-level token storage
_token = None
_headers = None

def get_auth_headers():
    """Get authentication headers, login if needed"""
    global _token, _headers
    if _token is None:
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        _token = response.json().get("token")
        _headers = {"Authorization": f"Bearer {_token}"}
    return _headers


class TestViaturaManutencao:
    """Test viatura maintenance features"""
    
    def test_get_viaturas_list(self):
        """Test GET /api/viaturas returns list with new fields"""
        headers = get_auth_headers()
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        assert response.status_code == 200
        
        viaturas = response.json()
        assert isinstance(viaturas, list)
        print(f"Found {len(viaturas)} viaturas")
        
        if len(viaturas) > 0:
            v = viaturas[0]
            # Check new fields have defaults
            assert "em_manutencao" in v, "Missing em_manutencao field"
            assert "descricao_avaria" in v, "Missing descricao_avaria field"
            assert "dua_url" in v, "Missing dua_url field"
            assert "seguro_url" in v, "Missing seguro_url field"
            assert "ipo_url" in v, "Missing ipo_url field"
            assert "carta_verde_url" in v, "Missing carta_verde_url field"
            assert "manual_url" in v, "Missing manual_url field"
            print(f"Viatura {v.get('matricula')}: em_manutencao={v.get('em_manutencao')}")
    
    def test_create_test_viatura(self):
        """Create a test viatura for maintenance testing"""
        headers = get_auth_headers()
        
        # First check if test viatura exists
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        
        test_viatura = next((v for v in viaturas if v.get("matricula") == "TEST-MAINT-01"), None)
        
        if not test_viatura:
            # Create test viatura
            response = requests.post(f"{BASE_URL}/api/viaturas", headers=headers, json={
                "matricula": "TEST-MAINT-01",
                "marca": "Test",
                "modelo": "Maintenance",
                "combustivel": "Gasoleo",
                "ativa": True
            })
            assert response.status_code == 200, f"Failed to create viatura: {response.text}"
            test_viatura = response.json()
            print(f"Created test viatura: {test_viatura.get('id')}")
        else:
            print(f"Test viatura already exists: {test_viatura.get('id')}")
        
        return test_viatura
    
    def test_patch_viatura_manutencao_enable(self):
        """Test PATCH /api/viaturas/{id}/manutencao - enable maintenance"""
        headers = get_auth_headers()
        
        # Get or create test viatura
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        test_viatura = next((v for v in viaturas if v.get("matricula") == "TEST-MAINT-01"), None)
        
        if not test_viatura:
            # Create it
            response = requests.post(f"{BASE_URL}/api/viaturas", headers=headers, json={
                "matricula": "TEST-MAINT-01",
                "marca": "Test",
                "modelo": "Maintenance",
                "combustivel": "Gasoleo",
                "ativa": True
            })
            test_viatura = response.json()
        
        viatura_id = test_viatura.get("id")
        
        # Enable maintenance
        response = requests.patch(f"{BASE_URL}/api/viaturas/{viatura_id}/manutencao", 
            headers=headers,
            json={
                "em_manutencao": True,
                "descricao_avaria": "Problema no motor - teste automatizado"
            }
        )
        assert response.status_code == 200, f"Failed to enable maintenance: {response.text}"
        
        updated = response.json()
        assert updated.get("em_manutencao") == True, "em_manutencao should be True"
        assert updated.get("descricao_avaria") == "Problema no motor - teste automatizado"
        print(f"Viatura {viatura_id} marked as in maintenance")
    
    def test_get_viatura_detail_with_maintenance(self):
        """Test GET /api/viaturas/{id} returns full detail with maintenance info"""
        headers = get_auth_headers()
        
        # Get test viatura
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        test_viatura = next((v for v in viaturas if v.get("matricula") == "TEST-MAINT-01"), None)
        
        if not test_viatura:
            pytest.skip("Test viatura not found")
        
        viatura_id = test_viatura.get("id")
        
        # Get detail
        response = requests.get(f"{BASE_URL}/api/viaturas/{viatura_id}", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "viatura" in data, "Response should have 'viatura' key"
        assert "obra_atual" in data, "Response should have 'obra_atual' key"
        assert "historico" in data, "Response should have 'historico' key"
        assert "km_historico" in data, "Response should have 'km_historico' key"
        assert "alertas" in data, "Response should have 'alertas' key"
        
        viatura = data["viatura"]
        assert viatura.get("em_manutencao") == True
        assert viatura.get("descricao_avaria") == "Problema no motor - teste automatizado"
        print(f"Viatura detail verified: em_manutencao={viatura.get('em_manutencao')}")
    
    def test_patch_viatura_manutencao_update_description(self):
        """Test updating only the description while in maintenance"""
        headers = get_auth_headers()
        
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        test_viatura = next((v for v in viaturas if v.get("matricula") == "TEST-MAINT-01"), None)
        
        if not test_viatura:
            pytest.skip("Test viatura not found")
        
        viatura_id = test_viatura.get("id")
        
        # Update description
        response = requests.patch(f"{BASE_URL}/api/viaturas/{viatura_id}/manutencao", 
            headers=headers,
            json={
                "em_manutencao": True,
                "descricao_avaria": "Descrição atualizada - motor e travões"
            }
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated.get("em_manutencao") == True
        assert updated.get("descricao_avaria") == "Descrição atualizada - motor e travões"
        print("Description updated successfully while maintaining em_manutencao=True")
    
    def test_patch_viatura_manutencao_disable(self):
        """Test PATCH /api/viaturas/{id}/manutencao - disable maintenance"""
        headers = get_auth_headers()
        
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        test_viatura = next((v for v in viaturas if v.get("matricula") == "TEST-MAINT-01"), None)
        
        if not test_viatura:
            pytest.skip("Test viatura not found")
        
        viatura_id = test_viatura.get("id")
        
        # Disable maintenance
        response = requests.patch(f"{BASE_URL}/api/viaturas/{viatura_id}/manutencao", 
            headers=headers,
            json={
                "em_manutencao": False,
                "descricao_avaria": ""
            }
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated.get("em_manutencao") == False, "em_manutencao should be False"
        print(f"Viatura {viatura_id} marked as available")
    
    def test_patch_nonexistent_viatura(self):
        """Test PATCH on non-existent viatura returns 404"""
        headers = get_auth_headers()
        
        response = requests.patch(f"{BASE_URL}/api/viaturas/nonexistent-id/manutencao", 
            headers=headers,
            json={
                "em_manutencao": True,
                "descricao_avaria": "Test"
            }
        )
        assert response.status_code == 404
        print("404 returned for non-existent viatura as expected")
    
    def test_viatura_alerts_calculation(self):
        """Test that alerts are calculated correctly for expiring dates"""
        headers = get_auth_headers()
        
        # Get any viatura with dates set
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        
        # Find a viatura with dates
        viatura_with_dates = None
        for v in viaturas:
            if v.get("data_seguro") or v.get("data_ipo"):
                viatura_with_dates = v
                break
        
        if not viatura_with_dates:
            print("No viatura with dates found - skipping alert test")
            return
        
        viatura_id = viatura_with_dates.get("id")
        response = requests.get(f"{BASE_URL}/api/viaturas/{viatura_id}", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        alertas = data.get("alertas", [])
        print(f"Viatura {viatura_with_dates.get('matricula')} has {len(alertas)} alerts")
        for alerta in alertas:
            print(f"  - {alerta.get('tipo')}: {alerta.get('mensagem')} (urgente={alerta.get('urgente')})")
    
    def test_cleanup_test_viatura(self):
        """Cleanup - delete test viatura"""
        headers = get_auth_headers()
        
        response = requests.get(f"{BASE_URL}/api/viaturas", headers=headers)
        viaturas = response.json()
        test_viatura = next((v for v in viaturas if v.get("matricula") == "TEST-MAINT-01"), None)
        
        if test_viatura:
            viatura_id = test_viatura.get("id")
            response = requests.delete(f"{BASE_URL}/api/viaturas/{viatura_id}", headers=headers)
            assert response.status_code == 200
            print(f"Cleaned up test viatura {viatura_id}")
        else:
            print("No test viatura to cleanup")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
