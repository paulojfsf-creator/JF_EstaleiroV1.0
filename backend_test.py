#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Construction Warehouse Management System
Tests all endpoints including authentication, CRUD operations, assignments, and exports.
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class WarehouseAPITester:
    def __init__(self, base_url="https://construction-hub-119.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_resources = {
            'machines': [],
            'equipment': [],
            'tools': [],
            'vehicles': [],
            'materials': [],
            'obras': []
        }

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def make_request(self, method: str, endpoint: str, data: dict = None, expected_status: int = 200) -> tuple:
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    # ==================== AUTHENTICATION TESTS ====================
    def test_login(self):
        """Test user login with existing credentials"""
        success, response = self.make_request(
            'POST', 'auth/login',
            data={"email": "test@test.com", "password": "test123"}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response.get('user', {})
            self.log_result("Login with existing user", True)
            return True
        else:
            self.log_result("Login with existing user", False, str(response))
            return False

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.token:
            self.log_result("Get current user info", False, "No token available")
            return False
            
        success, response = self.make_request('GET', 'auth/me')
        
        if success and 'id' in response:
            self.log_result("Get current user info", True)
            return True
        else:
            self.log_result("Get current user info", False, str(response))
            return False

    def test_register_new_user(self):
        """Test registering a new user"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_email = f"testuser_{timestamp}@test.com"
        
        success, response = self.make_request(
            'POST', 'auth/register',
            data={"name": f"Test User {timestamp}", "email": test_email, "password": "testpass123"}
        )
        
        if success and 'access_token' in response:
            self.log_result("Register new user", True)
            return True
        else:
            self.log_result("Register new user", False, str(response))
            return False

    # ==================== MACHINES TESTS ====================
    def test_machines_crud(self):
        """Test complete CRUD operations for machines"""
        # CREATE
        machine_data = {
            "name": "Escavadora Test",
            "quantity": 2,
            "location": "Armazém A",
            "status": "available",
            "next_maintenance": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "maintenance_interval_days": 90
        }
        
        success, response = self.make_request('POST', 'machines', data=machine_data, expected_status=200)
        if success and 'id' in response:
            machine_id = response['id']
            self.created_resources['machines'].append(machine_id)
            self.log_result("Create machine", True)
        else:
            self.log_result("Create machine", False, str(response))
            return False

        # READ ALL
        success, response = self.make_request('GET', 'machines')
        if success and isinstance(response, list):
            self.log_result("Get all machines", True)
        else:
            self.log_result("Get all machines", False, str(response))

        # UPDATE
        update_data = machine_data.copy()
        update_data["name"] = "Escavadora Test Updated"
        update_data["status"] = "maintenance"
        
        success, response = self.make_request('PUT', f'machines/{machine_id}', data=update_data)
        if success and response.get('name') == "Escavadora Test Updated":
            self.log_result("Update machine", True)
        else:
            self.log_result("Update machine", False, str(response))

        return True

    # ==================== EQUIPMENT TESTS ====================
    def test_equipment_crud(self):
        """Test complete CRUD operations for equipment"""
        equipment_data = {
            "name": "Berbequim Test",
            "quantity": 5,
            "location": "Armazém B",
            "status": "available"
        }
        
        success, response = self.make_request('POST', 'equipment', data=equipment_data)
        if success and 'id' in response:
            equipment_id = response['id']
            self.created_resources['equipment'].append(equipment_id)
            self.log_result("Create equipment", True)
        else:
            self.log_result("Create equipment", False, str(response))
            return False

        success, response = self.make_request('GET', 'equipment')
        if success and isinstance(response, list):
            self.log_result("Get all equipment", True)
        else:
            self.log_result("Get all equipment", False, str(response))

        return True

    # ==================== TOOLS TESTS ====================
    def test_tools_crud(self):
        """Test complete CRUD operations for tools"""
        tool_data = {
            "name": "Martelo Test",
            "quantity": 10,
            "location": "Armazém C",
            "status": "available"
        }
        
        success, response = self.make_request('POST', 'tools', data=tool_data)
        if success and 'id' in response:
            tool_id = response['id']
            self.created_resources['tools'].append(tool_id)
            self.log_result("Create tool", True)
        else:
            self.log_result("Create tool", False, str(response))
            return False

        success, response = self.make_request('GET', 'tools')
        if success and isinstance(response, list):
            self.log_result("Get all tools", True)
        else:
            self.log_result("Get all tools", False, str(response))

        return True

    # ==================== VEHICLES TESTS ====================
    def test_vehicles_crud(self):
        """Test complete CRUD operations for vehicles"""
        vehicle_data = {
            "name": "Camião Test",
            "quantity": 1,
            "location": "Parque de Viaturas",
            "status": "available",
            "plate": "AA-00-BB",
            "next_maintenance": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
            "maintenance_interval_days": 30
        }
        
        success, response = self.make_request('POST', 'vehicles', data=vehicle_data)
        if success and 'id' in response:
            vehicle_id = response['id']
            self.created_resources['vehicles'].append(vehicle_id)
            self.log_result("Create vehicle", True)
        else:
            self.log_result("Create vehicle", False, str(response))
            return False

        success, response = self.make_request('GET', 'vehicles')
        if success and isinstance(response, list):
            self.log_result("Get all vehicles", True)
        else:
            self.log_result("Get all vehicles", False, str(response))

        return True

    # ==================== MATERIALS TESTS ====================
    def test_materials_crud(self):
        """Test complete CRUD operations for materials"""
        material_data = {
            "name": "Cimento Test",
            "quantity": 100,
            "location": "Armazém D",
            "status": "available",
            "unit": "sacos"
        }
        
        success, response = self.make_request('POST', 'materials', data=material_data)
        if success and 'id' in response:
            material_id = response['id']
            self.created_resources['materials'].append(material_id)
            self.log_result("Create material", True)
        else:
            self.log_result("Create material", False, str(response))
            return False

        success, response = self.make_request('GET', 'materials')
        if success and isinstance(response, list):
            self.log_result("Get all materials", True)
        else:
            self.log_result("Get all materials", False, str(response))

        return True

    # ==================== OBRAS TESTS ====================
    def test_obras_crud(self):
        """Test complete CRUD operations for obras"""
        obra_data = {
            "name": "Obra Test Lisboa",
            "address": "Rua Test, Lisboa",
            "client_name": "Cliente Test",
            "status": "active"
        }
        
        success, response = self.make_request('POST', 'obras', data=obra_data)
        if success and 'id' in response:
            obra_id = response['id']
            self.created_resources['obras'].append(obra_id)
            self.log_result("Create obra", True)
        else:
            self.log_result("Create obra", False, str(response))
            return False

        success, response = self.make_request('GET', 'obras')
        if success and isinstance(response, list):
            self.log_result("Get all obras", True)
        else:
            self.log_result("Get all obras", False, str(response))

        return True

    # ==================== ASSIGNMENT TESTS ====================
    def test_resource_assignments(self):
        """Test resource assignment to obras"""
        if not self.created_resources['obras'] or not self.created_resources['machines']:
            self.log_result("Resource assignment", False, "No obra or machine available for testing")
            return False

        obra_id = self.created_resources['obras'][0]
        machine_id = self.created_resources['machines'][0]

        # Assign resource
        assignment_data = {
            "resource_id": machine_id,
            "resource_type": "machine",
            "obra_id": obra_id
        }
        
        success, response = self.make_request('POST', 'assignments', data=assignment_data)
        if success:
            self.log_result("Assign resource to obra", True)
        else:
            self.log_result("Assign resource to obra", False, str(response))
            return False

        # Get obra resources
        success, response = self.make_request('GET', f'obras/{obra_id}/resources')
        if success and 'machines' in response and len(response['machines']) > 0:
            self.log_result("Get obra resources", True)
        else:
            self.log_result("Get obra resources", False, str(response))

        # Unassign resource
        success, response = self.make_request('POST', 'assignments/unassign', data=assignment_data)
        if success:
            self.log_result("Unassign resource from obra", True)
        else:
            self.log_result("Unassign resource from obra", False, str(response))

        return True

    # ==================== SUMMARY TESTS ====================
    def test_dashboard_summary(self):
        """Test dashboard summary endpoint"""
        success, response = self.make_request('GET', 'summary')
        
        expected_keys = ['machines', 'equipment', 'tools', 'vehicles', 'materials', 'obras', 'alerts']
        if success and all(key in response for key in expected_keys):
            self.log_result("Get dashboard summary", True)
            return True
        else:
            self.log_result("Get dashboard summary", False, str(response))
            return False

    # ==================== EXPORT TESTS ====================
    def test_export_pdf(self):
        """Test PDF export functionality"""
        try:
            url = f"{self.api_url}/export/pdf"
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200 and response.headers.get('content-type') == 'application/pdf':
                self.log_result("Export PDF", True)
                return True
            else:
                self.log_result("Export PDF", False, f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
                return False
        except Exception as e:
            self.log_result("Export PDF", False, str(e))
            return False

    def test_export_excel(self):
        """Test Excel export functionality"""
        try:
            url = f"{self.api_url}/export/excel"
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(url, headers=headers, timeout=30)
            
            expected_content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            if response.status_code == 200 and response.headers.get('content-type') == expected_content_type:
                self.log_result("Export Excel", True)
                return True
            else:
                self.log_result("Export Excel", False, f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
                return False
        except Exception as e:
            self.log_result("Export Excel", False, str(e))
            return False

    # ==================== CLEANUP ====================
    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete in reverse order to handle dependencies
        for obra_id in self.created_resources['obras']:
            self.make_request('DELETE', f'obras/{obra_id}', expected_status=200)
        
        for machine_id in self.created_resources['machines']:
            self.make_request('DELETE', f'machines/{machine_id}', expected_status=200)
            
        for equipment_id in self.created_resources['equipment']:
            self.make_request('DELETE', f'equipment/{equipment_id}', expected_status=200)
            
        for tool_id in self.created_resources['tools']:
            self.make_request('DELETE', f'tools/{tool_id}', expected_status=200)
            
        for vehicle_id in self.created_resources['vehicles']:
            self.make_request('DELETE', f'vehicles/{vehicle_id}', expected_status=200)
            
        for material_id in self.created_resources['materials']:
            self.make_request('DELETE', f'materials/{material_id}', expected_status=200)

    # ==================== MAIN TEST RUNNER ====================
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Construction Warehouse API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Authentication Tests
        print("\n🔐 Authentication Tests")
        if not self.test_login():
            print("❌ Login failed - cannot continue with other tests")
            return False
            
        self.test_auth_me()
        self.test_register_new_user()

        # CRUD Tests
        print("\n📦 Resource CRUD Tests")
        self.test_machines_crud()
        self.test_equipment_crud()
        self.test_tools_crud()
        self.test_vehicles_crud()
        self.test_materials_crud()
        self.test_obras_crud()

        # Assignment Tests
        print("\n🔗 Resource Assignment Tests")
        self.test_resource_assignments()

        # Summary and Export Tests
        print("\n📊 Summary and Export Tests")
        self.test_dashboard_summary()
        self.test_export_pdf()
        self.test_export_excel()

        # Cleanup
        self.cleanup_test_data()

        # Results Summary
        print("\n" + "=" * 60)
        print("📋 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}/{self.tests_run}")
        
        if self.failed_tests:
            print("\n🚨 Failed Tests:")
            for failure in self.failed_tests:
                print(f"   • {failure['test']}: {failure['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return len(self.failed_tests) == 0

def main():
    """Main function"""
    tester = WarehouseAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())