import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { useTheme } from "@/contexts/ThemeContext";
export default function MarkdownEditor({
  value,
  onChange,
  height = 480,
  placeholder,
}: {
  value?: string;
  onChange?: (value: string) => void;
  height?: number | string;
  placeholder?: string;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <div data-color-mode={resolvedTheme} className="min-w-0">
      <MDEditor
        value={value}
        onChange={(v) => onChange?.(v || "")}
        height={height}
        textareaProps={{ placeholder, "aria-label": "Markdown 正文" }}
        previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
      />
    </div>
  );
}
