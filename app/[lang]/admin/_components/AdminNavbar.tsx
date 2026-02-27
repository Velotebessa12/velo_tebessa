"use client"
import { Separator } from '@/components/ui/separator'
import { Bell, Eye, LayoutDashboard, MoreVertical, Package, PackagePlus, PlusCircle, Search, ShoppingBag, Tag, View } from 'lucide-react'
import React, { useState } from 'react'

const AdminNavbar = () => {

    const [selectedPeriod , setSelectedPeriod ] = useState<any | null>(null)
    const [isOpen , setIsOpen] = useState(false)
 const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  return (


       <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="w-full flex justify-between gap-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-slate-100 border border-transparent rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7j">7 derniers jours</option>
              <option value="30j">30 derniers jours</option>
              <option value="12m">12 derniers mois</option>
            </select>

            <div className='flex items-center gap-3'>
               <div className="relative" >
     <button
  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
  className="relative p-2 cursor-pointer hover:bg-gray-100 rounded-xl transition-colors"
>
  <Bell className="w-5 h-5 text-slate-600" />

  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center rounded-full">
    3
  </span>
</button>


      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-50">
          <div className="p-4 border-b font-semibold text-slate-700">
            Notifications
          </div>

        {/* <span>Notifications will be here soon !</span> */}

          <div className="p-3 text-center border-t">
            <button className="text-sm text-gray-600 hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>

           
            </div>

          </div>
        </header>
  )
}

export default AdminNavbar
