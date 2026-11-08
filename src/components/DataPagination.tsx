import React from "react";
import { Button } from "@/components/ui/button";

/**
 * 通用数据表格分页组件，与"账号管理"风格保持一致。
 *
 * 视觉规范：
 * - 顶部分隔线 + mt-6 pt-4
 * - 左侧："共 X 条 · 第 N/M 页"
 * - 右侧：首页 / 上一页 / 下一页 / 末页（outline 按钮，size=sm）
 *
 * 使用约定：
 * - currentPage 为 0-based（与 Spring Data Page 一致）
 * - 仅一页时保留同一套统计文案和按钮区域，按钮 disabled
 * - 0 页时不渲染
 *
 * @author yz
 */
export interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageJump?: boolean;
  sequentialOnly?: boolean;
}

const DataPagination: React.FC<DataPaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  className,
  showPageJump = false,
  sequentialOnly = false,
}) => {
  const [jumpPage, setJumpPage] = React.useState(String(currentPage + 1));

  React.useEffect(() => {
    setJumpPage(String(currentPage + 1));
  }, [currentPage]);

  if (totalPages <= 0) return null;

  const parsedJumpPage = Number(jumpPage);
  const canJump =
    Number.isInteger(parsedJumpPage) &&
    parsedJumpPage >= 1 &&
    parsedJumpPage <= totalPages &&
    parsedJumpPage !== currentPage + 1;

  const handleJump = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canJump) return;
    onPageChange(parsedJumpPage - 1);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-border dark:border-white/10 ${className || ""}`}
    >
      <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
        共 {totalElements} 条 · 第 {currentPage + 1}/{totalPages} 页
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 [&_button]:whitespace-nowrap [&_button]:px-2 sm:[&_button]:px-3">
        {showPageJump && !sequentialOnly && totalPages > 1 && (
          <form className="flex items-center gap-1.5" onSubmit={handleJump}>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              跳至
            </span>
            <input
              type="number"
              min={1}
              max={totalPages}
              step={1}
              value={jumpPage}
              onChange={(event) => setJumpPage(event.target.value)}
              aria-label="跳转页码"
              className="h-9 w-16 rounded-md border border-input bg-background px-2 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">页</span>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!canJump}
            >
              跳转
            </Button>
          </form>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
        >
          首页
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          下一页
        </Button>
        {!sequentialOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
          >
            末页
          </Button>
        )}
      </div>
    </div>
  );
};

export default DataPagination;
