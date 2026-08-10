import { Search } from "lucide-react";

export function AdminSearch({ name, value, placeholder, action }: { name: string; value: string; placeholder: string; action: string }) {
  return <form className="admin-search" action={action} method="get" role="search">
    <Search aria-hidden="true"/>
    <input name={name} defaultValue={value} placeholder={placeholder} aria-label={placeholder}/>
    <button>搜尋</button>
  </form>;
}
