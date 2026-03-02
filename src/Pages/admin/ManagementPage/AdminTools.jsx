import React from "react";
import { Link } from "react-router-dom";
import {
  FolderSearch,
  Layers3,
  BadgeDollarSign,
  ReceiptText,
  ChartColumnBig,
  Repeat,
  Users,
} from "lucide-react";

function AdminTools() {
  const tools = [
    {
      to: "/management/classes",
      title: "Classes",
      icon: Layers3,
    },
    {
      to: "/teachers",
      title: "Tutors",
      icon: Users,
    },
    {
      to: "/management/billings",
      title: "Billings",
      icon: BadgeDollarSign,
    },
    {
      to: "/management/discounts",
      title: "Discounts",
      icon: FolderSearch,
    },
    {
      to: "/management/invoices-2.0",
      title: "Invoices",
      icon: ReceiptText,
    },
    {
      to: "/management/point-report",
      title: "Point report",
      icon: ChartColumnBig,
    },
    {
      to: "/management/point-exchange",
      title: "Exchange",
      icon: Repeat,
    },
  ];

  return (
    <div className="p-6 bg-slate-100 min-h-[calc(100vh-84px)]">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div>
          <h1 className="text-4xl text-center font-bold text-gray-900">
            Tools
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.to}
                to={tool.to}
                className="group flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white  text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-sm transition-all group-hover:from-purple-700 group-hover:to-purple-600">
                  <Icon size={28} strokeWidth={2} />
                </span>
                <span className="text-[16px] leading-none font-semibold text-slate-800 ">
                  {tool.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminTools;
