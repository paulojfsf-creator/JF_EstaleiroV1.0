"""
Test suite for ObraDetail page functionality:
- Obras list navigation (clickable rows)
- ObraDetail page with obra info
- Atribuir Equipamento/Viatura dialogs
- Movimento de Material dialog
- Devolver functionality
- APIs: /api/movimentos/atribuir, /api/movimentos/devolver, /api/movimentos-stock
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestObraDetailAPIs:
    """Test APIs for ObraDetail functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token = login_response.json().get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        yield
        
        # Cleanup - no specific cleanup needed
    
    # ==================== OBRAS LIST TESTS ====================
    def test_get_obras_list(self):
        """Test GET /api/obras returns list of obras"""
        response = self.session.get(f"{BASE_URL}/api/obras")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} obras")
        if len(data) > 0:
            obra = data[0]
            assert "id" in obra
            assert "codigo" in obra
            assert "nome" in obra
            print(f"First obra: {obra.get('codigo')} - {obra.get('nome')}")
    
    def test_get_obra_detail(self):
        """Test GET /api/obras/{id} returns obra with equipamentos and viaturas"""
        # First get list of obras
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        assert obras_response.status_code == 200
        obras = obras_response.json()
        
        if len(obras) == 0:
            pytest.skip("No obras available for testing")
        
        obra_id = obras[0]["id"]
        
        # Get obra detail
        response = self.session.get(f"{BASE_URL}/api/obras/{obra_id}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "obra" in data
        assert "equipamentos" in data
        assert "viaturas" in data
        
        obra = data["obra"]
        assert "id" in obra
        assert "codigo" in obra
        assert "nome" in obra
        assert "estado" in obra
        
        print(f"Obra: {obra.get('codigo')} - {obra.get('nome')}")
        print(f"Estado: {obra.get('estado')}")
        print(f"Equipamentos atribuídos: {len(data['equipamentos'])}")
        print(f"Viaturas atribuídas: {len(data['viaturas'])}")
    
    # ==================== ATRIBUIR EQUIPAMENTO TESTS ====================
    def test_atribuir_equipamento_success(self):
        """Test POST /api/movimentos/atribuir for equipamento"""
        # Get available equipamentos (not assigned to any obra)
        equip_response = self.session.get(f"{BASE_URL}/api/equipamentos")
        assert equip_response.status_code == 200
        equipamentos = equip_response.json()
        
        # Find an available equipamento
        available = [e for e in equipamentos if not e.get("obra_id")]
        if len(available) == 0:
            pytest.skip("No available equipamentos for testing")
        
        equipamento = available[0]
        
        # Get an obra
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        assert obras_response.status_code == 200
        obras = obras_response.json()
        
        if len(obras) == 0:
            pytest.skip("No obras available for testing")
        
        obra = obras[0]
        
        # Atribuir equipamento
        response = self.session.post(f"{BASE_URL}/api/movimentos/atribuir", json={
            "recurso_id": equipamento["id"],
            "tipo_recurso": "equipamento",
            "obra_id": obra["id"],
            "responsavel_levantou": "TEST_Responsavel",
            "observacoes": "TEST_Atribuição de teste"
        })
        
        assert response.status_code == 200, f"Failed to atribuir: {response.text}"
        data = response.json()
        assert "message" in data
        assert "movimento_id" in data
        print(f"Equipamento {equipamento['codigo']} atribuído à obra {obra['codigo']}")
        
        # Verify equipamento is now assigned
        equip_detail = self.session.get(f"{BASE_URL}/api/equipamentos/{equipamento['id']}")
        assert equip_detail.status_code == 200
        equip_data = equip_detail.json()
        assert equip_data["equipamento"]["obra_id"] == obra["id"]
        
        # Store for cleanup/devolver test
        self._test_equipamento_id = equipamento["id"]
        self._test_obra_id = obra["id"]
    
    def test_atribuir_equipamento_already_assigned(self):
        """Test that atribuir fails if equipamento already assigned to another obra"""
        # Get equipamentos
        equip_response = self.session.get(f"{BASE_URL}/api/equipamentos")
        equipamentos = equip_response.json()
        
        # Find an assigned equipamento
        assigned = [e for e in equipamentos if e.get("obra_id")]
        if len(assigned) == 0:
            pytest.skip("No assigned equipamentos for testing")
        
        equipamento = assigned[0]
        
        # Get a different obra
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        obras = obras_response.json()
        
        different_obra = None
        for obra in obras:
            if obra["id"] != equipamento.get("obra_id"):
                different_obra = obra
                break
        
        if not different_obra:
            pytest.skip("No different obra available for testing")
        
        # Try to atribuir to different obra - should fail
        response = self.session.post(f"{BASE_URL}/api/movimentos/atribuir", json={
            "recurso_id": equipamento["id"],
            "tipo_recurso": "equipamento",
            "obra_id": different_obra["id"],
            "responsavel_levantou": "TEST_Responsavel"
        })
        
        assert response.status_code == 400
        print(f"Correctly rejected: equipamento already assigned")
    
    # ==================== ATRIBUIR VIATURA TESTS ====================
    def test_atribuir_viatura_success(self):
        """Test POST /api/movimentos/atribuir for viatura"""
        # Get available viaturas
        viat_response = self.session.get(f"{BASE_URL}/api/viaturas")
        assert viat_response.status_code == 200
        viaturas = viat_response.json()
        
        # Find an available viatura
        available = [v for v in viaturas if not v.get("obra_id")]
        if len(available) == 0:
            pytest.skip("No available viaturas for testing")
        
        viatura = available[0]
        
        # Get an obra
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        obras = obras_response.json()
        
        if len(obras) == 0:
            pytest.skip("No obras available for testing")
        
        obra = obras[0]
        
        # Atribuir viatura
        response = self.session.post(f"{BASE_URL}/api/movimentos/atribuir", json={
            "recurso_id": viatura["id"],
            "tipo_recurso": "viatura",
            "obra_id": obra["id"],
            "responsavel_levantou": "TEST_Responsavel",
            "observacoes": "TEST_Atribuição de viatura"
        })
        
        assert response.status_code == 200, f"Failed to atribuir viatura: {response.text}"
        data = response.json()
        assert "message" in data
        assert "movimento_id" in data
        print(f"Viatura {viatura['matricula']} atribuída à obra {obra['codigo']}")
        
        # Store for devolver test
        self._test_viatura_id = viatura["id"]
    
    # ==================== DEVOLVER TESTS ====================
    def test_devolver_equipamento(self):
        """Test POST /api/movimentos/devolver for equipamento"""
        # Get equipamentos assigned to an obra
        equip_response = self.session.get(f"{BASE_URL}/api/equipamentos")
        equipamentos = equip_response.json()
        
        assigned = [e for e in equipamentos if e.get("obra_id")]
        if len(assigned) == 0:
            pytest.skip("No assigned equipamentos for devolver test")
        
        equipamento = assigned[0]
        
        # Devolver
        response = self.session.post(f"{BASE_URL}/api/movimentos/devolver", json={
            "recurso_id": equipamento["id"],
            "tipo_recurso": "equipamento",
            "responsavel_devolveu": "TEST_Responsavel_Devolucao",
            "observacoes": "TEST_Devolução de teste"
        })
        
        assert response.status_code == 200, f"Failed to devolver: {response.text}"
        data = response.json()
        assert "message" in data
        assert "movimento_id" in data
        print(f"Equipamento {equipamento['codigo']} devolvido com sucesso")
        
        # Verify equipamento is no longer assigned
        equip_detail = self.session.get(f"{BASE_URL}/api/equipamentos/{equipamento['id']}")
        assert equip_detail.status_code == 200
        equip_data = equip_detail.json()
        assert equip_data["equipamento"]["obra_id"] is None
    
    def test_devolver_viatura(self):
        """Test POST /api/movimentos/devolver for viatura"""
        # Get viaturas assigned to an obra
        viat_response = self.session.get(f"{BASE_URL}/api/viaturas")
        viaturas = viat_response.json()
        
        assigned = [v for v in viaturas if v.get("obra_id")]
        if len(assigned) == 0:
            pytest.skip("No assigned viaturas for devolver test")
        
        viatura = assigned[0]
        
        # Devolver
        response = self.session.post(f"{BASE_URL}/api/movimentos/devolver", json={
            "recurso_id": viatura["id"],
            "tipo_recurso": "viatura",
            "responsavel_devolveu": "TEST_Responsavel_Devolucao",
            "observacoes": "TEST_Devolução de viatura"
        })
        
        assert response.status_code == 200, f"Failed to devolver viatura: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"Viatura {viatura['matricula']} devolvida com sucesso")
    
    # ==================== MOVIMENTO STOCK TESTS ====================
    def test_movimento_stock_saida_with_obra(self):
        """Test POST /api/movimentos-stock with obra_id (Saida)"""
        # Get materiais
        mat_response = self.session.get(f"{BASE_URL}/api/materiais")
        assert mat_response.status_code == 200
        materiais = mat_response.json()
        
        if len(materiais) == 0:
            # Create a test material
            create_response = self.session.post(f"{BASE_URL}/api/materiais", json={
                "codigo": f"TEST_MAT_{uuid.uuid4().hex[:6]}",
                "descricao": "Material de Teste",
                "unidade": "un",
                "stock_minimo": 10
            })
            assert create_response.status_code == 200
            material = create_response.json()
        else:
            material = materiais[0]
        
        # Get an obra
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        obras = obras_response.json()
        
        if len(obras) == 0:
            pytest.skip("No obras available for testing")
        
        obra = obras[0]
        
        # Create movimento stock with obra_id
        response = self.session.post(f"{BASE_URL}/api/movimentos-stock", json={
            "material_id": material["id"],
            "tipo_movimento": "Saida",
            "quantidade": 5,
            "obra_id": obra["id"],
            "responsavel": "TEST_Responsavel",
            "observacoes": "TEST_Saída para obra"
        })
        
        assert response.status_code == 200, f"Failed to create movimento stock: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["obra_id"] == obra["id"]
        print(f"Movimento de stock criado para obra {obra['codigo']}")
    
    def test_movimento_stock_entrada_with_obra(self):
        """Test POST /api/movimentos-stock with obra_id (Entrada)"""
        # Get materiais
        mat_response = self.session.get(f"{BASE_URL}/api/materiais")
        materiais = mat_response.json()
        
        if len(materiais) == 0:
            pytest.skip("No materiais available for testing")
        
        material = materiais[0]
        
        # Get an obra
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        obras = obras_response.json()
        
        if len(obras) == 0:
            pytest.skip("No obras available for testing")
        
        obra = obras[0]
        
        # Create movimento stock entrada
        response = self.session.post(f"{BASE_URL}/api/movimentos-stock", json={
            "material_id": material["id"],
            "tipo_movimento": "Entrada",
            "quantidade": 10,
            "obra_id": obra["id"],
            "responsavel": "TEST_Responsavel",
            "observacoes": "TEST_Entrada/devolução de obra"
        })
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["tipo_movimento"] == "Entrada"
        print(f"Movimento de entrada criado para obra {obra['codigo']}")
    
    # ==================== AVAILABLE RESOURCES TESTS ====================
    def test_get_available_equipamentos(self):
        """Test that we can filter equipamentos without obra_id"""
        response = self.session.get(f"{BASE_URL}/api/equipamentos")
        assert response.status_code == 200
        equipamentos = response.json()
        
        available = [e for e in equipamentos if not e.get("obra_id")]
        assigned = [e for e in equipamentos if e.get("obra_id")]
        
        print(f"Total equipamentos: {len(equipamentos)}")
        print(f"Disponíveis (sem obra): {len(available)}")
        print(f"Atribuídos (com obra): {len(assigned)}")
    
    def test_get_available_viaturas(self):
        """Test that we can filter viaturas without obra_id"""
        response = self.session.get(f"{BASE_URL}/api/viaturas")
        assert response.status_code == 200
        viaturas = response.json()
        
        available = [v for v in viaturas if not v.get("obra_id")]
        assigned = [v for v in viaturas if v.get("obra_id")]
        
        print(f"Total viaturas: {len(viaturas)}")
        print(f"Disponíveis (sem obra): {len(available)}")
        print(f"Atribuídas (com obra): {len(assigned)}")
    
    # ==================== ERROR HANDLING TESTS ====================
    def test_atribuir_invalid_recurso(self):
        """Test atribuir with invalid recurso_id"""
        obras_response = self.session.get(f"{BASE_URL}/api/obras")
        obras = obras_response.json()
        
        if len(obras) == 0:
            pytest.skip("No obras available")
        
        response = self.session.post(f"{BASE_URL}/api/movimentos/atribuir", json={
            "recurso_id": "invalid-id-12345",
            "tipo_recurso": "equipamento",
            "obra_id": obras[0]["id"],
            "responsavel_levantou": "TEST"
        })
        
        assert response.status_code == 404
        print("Correctly returned 404 for invalid recurso_id")
    
    def test_devolver_invalid_recurso(self):
        """Test devolver with invalid recurso_id"""
        response = self.session.post(f"{BASE_URL}/api/movimentos/devolver", json={
            "recurso_id": "invalid-id-12345",
            "tipo_recurso": "equipamento",
            "responsavel_devolveu": "TEST"
        })
        
        assert response.status_code == 404
        print("Correctly returned 404 for invalid recurso_id")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
