// import { ChevronRight, Grid3X3, List, Menu, Trophy, Users } from "lucide-react";
// import { cn } from '@/lib/utils'

// const navigationItems = [
//   {
//     id: "systems",
//     label: "Systems",
//     icon: Grid3X3,
//     active: false,
//     children: [
//       { id: "system-code", label: "System Code", active: false },
//       { id: "properties", label: "Properties", active: false },
//     ],
//   },
//   {
//     id: "menus",
//     label: "Menus",
//     icon: Menu,
//     active: true,
//   },
//   {
//     id: "api-list",
//     label: "API List",
//     icon: List,
//     active: false,
//   },
//   {
//     id: "users-group",
//     label: "Users & Group",
//     icon: Users,
//     active: false,
//   },
//   {
//     id: "competition",
//     label: "Competition",
//     icon: Trophy,
//     active: false,
//   },
// ];

// export function Sidebar() {
//   return (
//     <div className="w-64 bg-slate-800 text-white flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-slate-700">
//         <div className="flex items-center justify-between">
//           <h1 className="text-xl font-bold">CLOIT</h1>
//           <ChevronRight className="w-5 h-5" />
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 space-y-2">
//         {navigationItems.map((item) => (
//           <div key={item.id}>
//             <div
//               className={cn(
//                 "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
//                 item.active
//                   ? "bg-green-500 text-white"
//                   : "text-slate-300 hover:bg-slate-700 hover:text-white"
//               )}
//             >
//               <item.icon className="w-5 h-5" />
//               <span className="text-sm font-medium">{item.label}</span>
//             </div>

//             {/* Sub-items */}
//             {item.children && (
//               <div className="ml-8 mt-1 space-y-1">
//                 {item.children.map((child) => (
//                   <div
//                     key={child.id}
//                     className={cn(
//                       "flex items-center gap-2 px-3 py-1 rounded text-sm cursor-pointer transition-colors",
//                       child.active
//                         ? "bg-slate-600 text-white"
//                         : "text-slate-400 hover:bg-slate-700 hover:text-white"
//                     )}
//                   >
//                     <Grid3X3 className="w-4 h-4" />
//                     <span>{child.label}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </nav>
//     </div>
//   );
// }
