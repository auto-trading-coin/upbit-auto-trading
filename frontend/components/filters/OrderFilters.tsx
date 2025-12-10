import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface OrderFiltersProps {
    filters: {
        market: string
        startDate: string
        endDate: string
        side: string
    }
    onFilterChange: (filters: OrderFiltersProps["filters"]) => void
    onReset: () => void
}

export function OrderFilters({ filters, onFilterChange, onReset }: OrderFiltersProps) {
    const handleChange = (key: keyof typeof filters, value: string) => {
        onFilterChange({ ...filters, [key]: value })
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== "")

    return (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">필터</h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-8 text-xs"
                    >
                        <X className="h-3 w-3 mr-1" />
                        초기화
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 마켓 검색 */}
                <div className="space-y-2">
                    <Label htmlFor="market" className="text-xs">마켓</Label>
                    <Input
                        id="market"
                        placeholder="예: KRW-BTC"
                        value={filters.market}
                        onChange={(e) => handleChange("market", e.target.value)}
                        className="h-9"
                    />
                </div>

                {/* 시작 날짜 */}
                <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs">시작 날짜</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        className="h-9"
                    />
                </div>

                {/* 종료 날짜 */}
                <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs">종료 날짜</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        className="h-9"
                    />
                </div>

                {/* 매수/매도 */}
                <div className="space-y-2">
                    <Label htmlFor="side" className="text-xs">매매 유형</Label>
                    <Select
                        value={filters.side || "all"}
                        onValueChange={(value) => handleChange("side", value === "all" ? "" : value)}
                    >
                        <SelectTrigger id="side" className="h-9">
                            <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="bid">매수</SelectItem>
                            <SelectItem value="ask">매도</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
