"use client";

import { Instagram, Facebook, Phone, Mail, MapPin, Globe, Youtube } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
export default function SocialsPage() {
  const socials = [
  {
    name: "Instagram",
    value: "@velotebessa",
    link: "https://instagram.com/velotebessa",
    icon: Instagram,
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    name: "Facebook",
    value: "Velo Tebessa",
    link: "https://facebook.com/velotebessa",
    icon: Facebook,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    name: "TikTok",
    value: "@velotebessa",
    link: "https://www.tiktok.com/@velotebessa",
    icon: FaTiktok,
    color: "text-black",
    bg: "bg-gray-100",
  },
  {
    name: "YouTube",
    value: "Velo Tebessa",
    link: "https://www.youtube.com/@velotebessa",
    icon: Youtube,
    color: "text-red-500",
    bg: "bg-red-50",
  },
];
  const contacts = [
    { name: "Phone", value: "+213 000 000 000", icon: Phone },
    { name: "Email", value: "contact@velotebessa.com", icon: Mail },
    { name: "Address", value: "Tebessa, Algeria", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-2">Velo Tebessa</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Connect With Us</h1>
          <p className="text-sm text-gray-400">All official Velo Tebessa links and contact info in one place.</p>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Social Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socials.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 border border-gray-100 rounded-2xl hover:border-teal-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className={`${item.bg} p-2.5 rounded-xl flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-teal-600 transition-colors">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Contact Information</h2>
          <div className="space-y-2.5">
            {contacts.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-xl"
              >
                <div className="bg-teal-50 p-2 rounded-lg flex-shrink-0">
                  <item.icon className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">{item.name}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <p className="text-center text-xs text-gray-400 leading-relaxed px-4">
          Velo Tebessa is your trusted destination for bicycles, accessories and professional service in Algeria.
        </p>

      </div>
    </div>
  );
}