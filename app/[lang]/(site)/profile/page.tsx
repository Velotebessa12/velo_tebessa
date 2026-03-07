"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  Shield,
  LogOut,
  Edit,
  MapPin,
  Calendar,
  Package,
  Clock,
} from "lucide-react";
import { useLang } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
  const [user, setUser] = useState<any | null>(null);
  const { lang , dict} = useLang();
  const router = useRouter();
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  function handleSignOut() {
    toast.success("Logout successfully!");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {dict.profile.notLoggedIn}
          </h2>
          <p className="text-gray-600 mb-6">
            {dict.profile.loginRequired}
          </p>
          <a
            href={`/${lang}/login`}
            className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg"
          >
            {dict.profile.goToLogin}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50"></div>

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="w-28 h-28 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-4xl font-semibold text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </div>

                <div className="sm:ml-2 mb-2">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    {user.name || "User"}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {dict.profile.memberSince}{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).getFullYear()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {dict.profile.contactInfo}
              </h2>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{dict.profile.phone}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.phoneNumber || dict.profile.notProvided}
                    </p>
                  </div>
                </div>

                {/* Wilaya */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{dict.profile.wilaya}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.wilaya || dict.profile.notProvided}
                    </p>
                  </div>
                </div>

                {/* Address */}
                {user.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-0.5">{dict.profile.address}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {user.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {dict.profile.quickActions}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/${lang}/orders`)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-2.5"
                >
                  <Package className="w-4 h-4 text-gray-400" />
                  {dict.profile.viewOrders}
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {dict.profile.accountDetails}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-t border-gray-100">
                  <span className="text-sm text-gray-400">{dict.profile.totalOrders}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {user.orders?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-t border-gray-100">
                  <span className="text-sm text-gray-400">{dict.profile.joined}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-t border-gray-100">
                  <span className="text-sm text-gray-400">{dict.profile.lastUpdated}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.updatedAt ? formatDate(user.updatedAt) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {dict.profile.needHelp}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {dict.profile.helpText}
              </p>
              <div className="flex flex-col gap-2">
                <button className="w-full px-4 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {dict.profile.contactSupport}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="group w-full px-4 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200"
                >
                  <LogOut
                    size={18}
                    className="flex-shrink-0 text-gray-400 transition-colors group-hover:text-red-600"
                  />
                  <span className="transition-colors group-hover:text-red-600">
                    {dict.profile.signOut}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
