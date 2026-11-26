import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface HelpSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function HelpSearch({ searchQuery, setSearchQuery }: HelpSearchProps) {
    return (
        <Card className="bg-secondary/20 shadow-md">
            <CardContent className="pt-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi, ví dụ: 'quên mật khẩu', 'nâng cấp tài khoản'..."
                        className="h-12 bg-background pl-10 pr-4 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}