import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TablePaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    totalElements: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
}

export function TablePagination({
    currentPage,
    totalPages,
    pageSize,
    totalElements,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 30, 50],
}: TablePaginationProps) {
    // 현재 페이지 범위 계산 (예: 1-10 중 10)
    const startRow = currentPage * pageSize + 1
    const endRow = Math.min((currentPage + 1) * pageSize, totalElements)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            {/* 왼쪽: 총 개수 및 페이지 사이즈 선택 */}
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium whitespace-nowrap">페이지 당 행:</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            onPageSizeChange?.(Number(value))
                        }}
                        disabled={!onPageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                    {totalElements > 0 ? (
                        <>
                            {startRow}-{endRow} / {totalElements}
                        </>
                    ) : (
                        "데이터 없음"
                    )}
                </div>
            </div>

            {/* 오른쪽: 페이지 이동 버튼 */}
            <div className="flex items-center gap-1 sm:gap-2">
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 sm:flex"
                    onClick={() => onPageChange(0)}
                    disabled={currentPage === 0}
                >
                    <span className="sr-only">첫 페이지로</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    <span className="sr-only">이전 페이지로</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap px-2">
                    {currentPage + 1} / {Math.max(totalPages, 1)} 페이지
                </div>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                >
                    <span className="sr-only">다음 페이지로</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 sm:flex"
                    onClick={() => onPageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                >
                    <span className="sr-only">마지막 페이지로</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
