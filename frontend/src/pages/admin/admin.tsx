import { Button } from "@/components/ui/button";
import { adminPrefix } from "@/lib/config";
import { Link } from "react-router";

export default function Admin() {
  return (
    <div className="flex flex-col justify-center items-center min-h-48">
      <Link to={`${adminPrefix}/create-app`}>
        <Button className="mt-4">新建应用</Button>
      </Link>
    </div>
  );
}
