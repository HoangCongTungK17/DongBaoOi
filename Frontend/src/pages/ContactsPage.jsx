import React from "react";
import { Phone, Shield, Ambulance, Flame, ArrowRight } from "lucide-react";

// Dữ liệu mẫu
const emergencyContacts = [
  {
    id: 1,
    name: "Cảnh sát phản ứng nhanh",
    phone: "113",
    description: "An ninh trật tự, tội phạm, đánh nhau, trộm cướp...",
    icon: Shield,
    color: "blue",
  },
  {
    id: 2,
    name: "Cứu hỏa & Cứu nạn",
    phone: "114",
    description: "Hỏa hoạn, cháy nổ, mắc kẹt trong đám cháy, cứu hộ...",
    icon: Flame,
    color: "red",
  },
  {
    id: 3,
    name: "Cấp cứu y tế",
    phone: "115",
    description: "Tai nạn thương tích, bệnh lý nguy kịch, cần xe cấp cứu...",
    icon: Ambulance,
    color: "green",
  },
];

const localContacts = [
  { id: 1, name: "UBND Xã/Phường", phone: "024.3838.xxxx" },
  { id: 2, name: "Trưởng Ban Chỉ Huy PCTT", phone: "0909.123.456" },
  { id: 3, name: "Y tế Phường", phone: "0988.777.666" },
];

function ContactsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Liên hệ Khẩn cấp
          </h1>
          <p className="mt-2 text-slate-400">
            Danh sách các số điện thoại quan trọng cần gọi khi gặp sự cố
          </p>
        </div>

        {/* Emergency Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {emergencyContacts.map((item) => {
            const Icon = item.icon;
            // Xử lý màu sắc động
            const colorClasses = {
              blue: "bg-blue-900/20 text-blue-400 ring-blue-500/30",
              red: "bg-red-900/20 text-red-400 ring-red-500/30",
              green: "bg-green-900/20 text-green-400 ring-green-500/30",
            };

            return (
              <div
                key={item.id}
                className="group relative flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-lg transition-all hover:-translate-y-1 hover:border-slate-700"
              >
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ring-1 ${colorClasses[item.color]}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                
                <div className="mt-6 w-full">
                  <a
                    href={`tel:${item.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-xl font-bold text-white hover:bg-slate-700"
                  >
                    <Phone className="h-5 w-5" />
                    {item.phone}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Local Contacts Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-semibold text-white">Danh bạ Cán bộ địa phương</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              Hỗ trợ 24/7
            </span>
          </div>
          
          <div className="mt-6 divide-y divide-slate-800">
            {localContacts.map((person) => (
              <div key={person.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300 font-bold">
                    {person.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-200">{person.name}</span>
                </div>
                <a
                  href={`tel:${person.phone}`}
                  className="group mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 sm:mt-0 hover:text-indigo-300"
                >
                  <Phone className="h-4 w-4" />
                  {person.phone}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactsPage;