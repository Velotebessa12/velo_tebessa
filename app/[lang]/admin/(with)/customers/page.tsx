'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import PopUp from '@/components/PopUp';

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All Customers');
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer , setSelectedCustomer ] = useState(null)
  const [isUnique , setIsUnique ] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {

        const res = await fetch("/api/customers/get-customers");

        if (!res.ok) {
          throw new Error("Error fetching Customers");
        }

        const { customers } = await res.json();
        setCustomers(customers);



      } catch (error) {
        toast.error("Error fetching Customers");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Calculate stats
  const totalCustomers = customers.length;
  const returningCustomers = customers.filter(c => c.orders > 1).length;
  const newCustomers = customers.filter(c => c.orders === 1).length;

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.wilaya?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.commune?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      customerFilter === 'All Customers' ||
      (customerFilter === 'Returning Customers' && customer.orders > 1) ||
      (customerFilter === 'New Customers' && customer.orders === 1);
    
    return matchesSearch && matchesFilter;
  });

  const handleView = (id) => {
    console.log('View customer:', id);
  };


   function openEditPopup(customer) {
    setSelectedCustomer(customer);
    setIsEditingOpen(true);
  }

  function openDeletePopup(customer) {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  }

  if(isLoading){
    return <Loader/>
  }

  return (
    <div className="p-3 sm:p-4">

  {isDeleteOpen && (
    <PopUp
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      children={
        <div className="w-full flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Deactivate "customer"
          </h2>
          <p className="text-sm text-gray-500">
            Note: You can only deactive this customer if it has no associated orders.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Are you sure you want to deactive this customer?
            <br />
            <span className="text-red-500 font-medium">you can update it later.</span>
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => { handleDeactivateProduct(); setIsDeleteOpen(false); }}
              className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Yes, Sure
            </button>
          </div>
        </div>
      }
    />
  )}

  {isEditingOpen && (
    <PopUp
      isOpen={isEditingOpen}
      onClose={() => setIsEditingOpen(false)}
      children={
        <div className="w-full font-sans">

          {/* Name + Phone */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                value={selectedCustomer.name}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                value={selectedCustomer.phoneNumber}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Wilaya + Commune */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wilaya <span className="text-red-500">*</span>
              </label>
              <input
                value={selectedCustomer.wilaya}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commune <span className="text-red-500">*</span>
              </label>
              <input
                value={selectedCustomer.commune}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse <span className="text-red-500">*</span>
            </label>
            <textarea
              value={selectedCustomer.commune}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={selectedCustomer?.password || ""}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm text-gray-800 bg-gray-100 cursor-not-allowed focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Classification */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Classification Client</h3>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">Client unique</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Les clients uniques reçoivent des réductions spéciales
                </p>
              </div>
              <button
                onClick={() => setIsUnique((v) => !v)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isUnique ? "bg-teal-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isUnique ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 my-5" />

          <div className="flex items-center justify-end gap-3">
            <button className="px-4 sm:px-5 py-2 rounded-md text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button className="px-4 sm:px-5 py-2 rounded-md text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white transition-colors">
              Enregistrer
            </button>
          </div>
        </div>
      }
    />
  )}

  {/* ── Statistics Grid ──────────────────────────────────────────────────── */}
  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
        Total
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
        {totalCustomers}
      </p>
    </div>
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 mb-1">
        <span className="hidden sm:inline">Unique</span>
        <span className="sm:hidden">Unique.</span>
      </p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
        {returningCustomers}
      </p>
    </div>
   
  </div>

  {/* ── Search and Filter ────────────────────────────────────────────────── */}
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
        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
    </div>
    <select
      value={customerFilter}
      onChange={(e) => setCustomerFilter(e.target.value)}
      className="w-full sm:w-48 px-3 py-2.5 border border-teal-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
    >
      <option>All Customers</option>
      <option>Unique Customers</option>
    </select>
  </div>

  {/* ── Customers Table ──────────────────────────────────────────────────── */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {isLoading ? (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">Loading customers...</p>
      </div>
    ) : (
      <>
        {/* Desktop table (lg+) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Phone", "Wilaya", "Address", "Orders", "Type", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.wilaya}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.commune || customer.adress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.customerOrders.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {customer.type || "New"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(customer.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditPopup(customer)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeletePopup(customer)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
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

        {/* Tablet table (sm–lg): hide Address column */}
        <div className="hidden sm:block lg:hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Phone", "Wilaya", "Orders", "Type", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {customer.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {customer.wilaya}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center">
                    {customer.customerOrders.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {customer.type || "New"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleView(customer.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditPopup(customer)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => openDeletePopup(customer)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list (below sm) */}
        <div className="sm:hidden divide-y divide-gray-100">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-3 hover:bg-gray-50 transition-colors">

              {/* Row 1: name + type badge */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {customer.name}
                </span>
                <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                  {customer.type || "New"}
                </span>
              </div>

              {/* Row 2: phone · wilaya · orders */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                <span className="text-xs text-gray-600">{customer.phoneNumber}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-500">{customer.wilaya}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-500">
                  {customer.customerOrders.length || 0} order{customer.customerOrders.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Row 3: address + actions */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400 truncate">
                  {customer.commune || customer.adress || "—"}
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => handleView(customer.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => openEditPopup(customer)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => openDeletePopup(customer)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </>
    )}

    {!isLoading && filteredCustomers.length === 0 && (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No customers found</p>
      </div>
    )}
  </div>

</div>
  );
};

export default Page;