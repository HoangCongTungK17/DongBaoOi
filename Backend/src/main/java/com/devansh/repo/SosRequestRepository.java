package com.devansh.repo;

import com.devansh.model.SosRequest;
import com.devansh.model.enums.DisasterType;
import com.devansh.model.enums.SosStatus;
import org.springframework.data.domain.Page; // Quan trọng: Thêm để dùng Page
import org.springframework.data.domain.Pageable; // Quan trọng: Thêm để dùng Pageable
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SosRequestRepository extends JpaRepository<SosRequest, Integer> {

    // Trả về danh sách SOS của một User cụ thể
    List<SosRequest> findByUserId(Integer id);

    // TỐI ƯU: Tìm kiếm theo trạng thái có phân trang cho Admin
    Page<SosRequest> findByStatus(SosStatus status, Pageable pageable);
    
    // TỐI ƯU: Tìm kiếm theo khu vực thiên tai có phân trang cho Admin
    Page<SosRequest> findByDisasterZoneId(Integer zoneId, Pageable pageable);

    // TỐI ƯU: Kết hợp lọc theo khu vực và trạng thái có phân trang
    Page<SosRequest> findByDisasterZoneIdAndStatus(Integer zoneId, SosStatus status, Pageable pageable);

    // Tìm kiếm theo loại thảm họa
    List<SosRequest> findByDisasterType(DisasterType disasterType);

    // Đếm số lượng yêu cầu theo trạng thái (Dùng cho Dashboard)
    long countByStatus(SosStatus status);

    // Lấy danh sách 11 yêu cầu mới nhất (Dùng hiển thị nhanh trên Dashboard)
    List<SosRequest> findTop11ByOrderByCreatedAtDesc();

    // Thống kê số lượng yêu cầu trong một khoảng thời gian
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}