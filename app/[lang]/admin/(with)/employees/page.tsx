'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, User, UserCog, Users, EyeOff, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import PopUp from '@/components/PopUp';
import Loader from '@/components/Loader';
import { PERMISSION_OPTIONS } from '@/data';

interface Employee {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MANAGER' | 'WORKER';
  isActive: boolean;
  icon: 'user' | 'shield' | 'star';
}

// ── Shared form fields ────────────────────────────────────────────────────────
function EmployeeForm({
  name, setName,
  email, setEmail,
  phoneNumber, setPhoneNumber,
  password, setPassword,
  role, setRole,
  permissions, togglePermission,
  onSave, onCancel,
  saveLabel = 'Save',
}: {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phoneNumber: string; setPhoneNumber: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  role: string; setRole: (v: string) => void;
  permissions: string[]; togglePermission: (k: string) => void;
  onSave: () => void; onCancel: () => void;
  saveLabel?: string;
}) {

  const [showPassword , setShowPassword] = useState(false)

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* Name + Phone */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Employee name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="text"
            placeholder="Phone number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="email@example.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Password + Role */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
       <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Password
  </label>

  <div className="relative">
    <input
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-teal-500"
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
      tabIndex={-1}
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  </div>
</div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="" disabled>Select Role</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="WORKER">Worker</option>
          </select>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {PERMISSION_OPTIONS.map((perm) => (
            <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.includes(perm.key)}
                onChange={() => togglePermission(perm.key)}
                className="w-4 h-4 accent-teal-500"
              />
              <span className="text-xs sm:text-sm text-gray-700">{perm.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active */}
      <div className="flex items-center gap-2">
        <input type="checkbox" defaultChecked className="w-4 h-4 accent-teal-500" />
        <span className="text-sm text-gray-700">Active</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onSave}
          className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium transition"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees/get-employees');
        if (!res.ok) throw new Error('Error fetching Employees');
        const { employees } = await res.json();
        setEmployees(employees);
      } catch (error) {
        toast.error('Error fetching Employees');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.isActive).length;
  const admins = employees.filter((e) => e.role === 'ADMIN').length;
  const workers = employees.filter((e) => e.role === 'WORKER').length;

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phoneNumber?.includes(searchTerm);
    const matchesType =
      typeFilter === 'All Types' || employee.role === typeFilter;
    return matchesSearch && matchesType;
  });

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleNewEmployee = async () => {
    try {
      const res = await fetch('/api/employees/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber, email, password, role, permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create employee');

      setEmployees(prev => [data.employee , ...prev])
      toast.success('Employee created successfully');
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  function handleEdit(employee: any) {
    setSelectedEmployee(employee);
    setName(employee.name);
    setEmail(employee.email);
    setPhoneNumber(employee.phoneNumber);
    setPassword(employee.password);
    setRole(employee.role);
    setPermissions([]);
    setIsEditingOpen(true);
  }

  function handleDelete(employee: Employee) {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  }

  function resetForm() {
    setName(''); setEmail(''); setPhoneNumber('');
    setPassword(''); setRole(''); setPermissions([]);
  }

  const getTypeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':    return 'bg-blue-100 text-blue-800';
      case 'MANAGER':  return 'bg-purple-100 text-purple-800';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'shield': return <UserCog size={18} className="text-gray-400 flex-shrink-0" />;
      case 'star':   return <Users size={18} className="text-gray-400 flex-shrink-0" />;
      default:       return <User size={18} className="text-gray-400 flex-shrink-0" />;
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">

      {/* ── Delete Popup ─────────────────────────────────────────────────────── */}
      {isDeleteOpen && (
        <PopUp isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}
          children={
            <div className="w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">Delete Employee</h2>
              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-900">{selectedEmployee?.name}</span>?
                <br />
                <span className="text-red-500 font-medium">This action cannot be undone.</span>
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { console.log('delete', selectedEmployee?.id); setIsDeleteOpen(false); }}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* ── Edit Popup ───────────────────────────────────────────────────────── */}
      {isEditingOpen && selectedEmployee && (
        <PopUp isOpen={isEditingOpen} onClose={() => setIsEditingOpen(false)}
          children={
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Edit Employee
              </h2>
              <EmployeeForm
                name={name} setName={setName}
                email={email} setEmail={setEmail}
                phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                password={password} setPassword={setPassword}
                role={role} setRole={setRole}
                permissions={permissions} togglePermission={togglePermission}
                onSave={handleNewEmployee}
                onCancel={() => setIsEditingOpen(false)}
                saveLabel="Save Changes"
              />
            </div>
          }
        />
      )}

      {/* ── New Employee Popup ───────────────────────────────────────────────── */}
      <PopUp isOpen={isOpen} onClose={() => { setIsOpen(false); resetForm(); }} title="New Employee">
        <EmployeeForm
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
          password={password} setPassword={setPassword}
          role={role} setRole={setRole}
          permissions={permissions} togglePermission={togglePermission}
          onSave={handleNewEmployee}
          onCancel={() => { setIsOpen(false); resetForm(); }}
          saveLabel="Create"
        />
      </PopUp>

      <div>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
            Employees
          </h1>
          <button
            onClick={() => { resetForm(); setIsOpen(true); }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition text-xs sm:text-sm font-medium"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">New Employee</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total', fullLabel: 'Total Employees', value: totalEmployees },
            { label: 'Active',  fullLabel: 'Active',   value: activeEmployees },
            { label: 'Admins',  fullLabel: 'Admins',   value: admins },
            { label: 'Workers', fullLabel: 'Workers',  value: workers },
          ].map(({ label, fullLabel, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
                <span className="hidden sm:inline">{fullLabel}</span>
                <span className="sm:hidden">{label}</span>
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="All Types">All Types</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="WORKER">Worker</option>
          </select>
        </div>

        {/* ── Table / Cards ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getIcon(employee.icon)}
                        <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {employee.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(employee.role)}`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        employee.isActive ? 'bg-gray-100 text-teal-600' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet card list (below md) */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">

                {/* Row 1: icon + name + role badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {getIcon(employee.icon)}
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {employee.name}
                    </span>
                  </div>
                  <span className={`flex-shrink-0 inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${getTypeColor(employee.role)}`}>
                    {employee.role}
                  </span>
                </div>

                {/* Row 2: email · phone */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2 ml-6">
                  <span className="text-xs text-gray-600 truncate">{employee.email}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{employee.phoneNumber}</span>
                </div>

                {/* Row 3: status + actions */}
                <div className="flex items-center justify-between gap-2 ml-6">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    employee.isActive ? 'bg-gray-100 text-teal-600' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <p className="text-gray-500 text-sm">No employees found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}