import { useState } from "react";
import { useManagementPage } from "../../management/hooks/useManagementPage";
export function useCategoriesPage() {
  const hook = useManagementPage("adminCategories", "/categories");
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const edit = (category) => {
    setEditing(category);
    setName(category?.name || "");
  };
  const submit = (event) => {
    event.preventDefault();
    hook.mutation.mutate(
      {
        method: editing?._id ? "patch" : "post",
        id: editing?._id,
        data: { name },
      },
      {
        onSuccess: () => {
          setEditing(null);
          setName("");
        },
      },
    );
  };
  return { ...hook, editing, name, setName, edit, submit };
}
