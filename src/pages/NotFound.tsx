import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-5 text-2xl font-semibold">页面未找到</h1>
      <p className="my-6 text-muted-foreground">
        请检查访问地址，或返回仪表盘。
      </p>
      <Button asChild>
        <Link to="/dashboard">返回仪表盘</Link>
      </Button>
    </div>
  );
}
