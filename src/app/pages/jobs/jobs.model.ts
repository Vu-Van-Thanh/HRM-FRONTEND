export interface Job {
    Link: string;
    Web: string;
    Nganh: string;
    TenCV: string;
    CongTy: string;
    TinhThanh: string;
    Luong: string;
    LoaiHinh: string;
    KinhNghiem: string;
    CapBac: string;
    HanNopCV: string;
    YeuCau: string;
    MoTa: string;
    PhucLoi: string;
    SoLuong: string;
    Image: string;
}

export interface JobResponse {
    items: Job[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
} 