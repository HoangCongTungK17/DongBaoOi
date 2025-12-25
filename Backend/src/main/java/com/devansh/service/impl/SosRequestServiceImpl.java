package com.devansh.service.impl;

import com.devansh.exception.SosException;
import com.devansh.mapper.SosRequestMapper;
import com.devansh.model.SosRequest;
import com.devansh.model.User;
import com.devansh.model.enums.SosStatus;
import com.devansh.repo.SosRequestRepository;
import com.devansh.request.CreateSosRequest;
import com.devansh.response.MessageResponse;
import com.devansh.response.SosRequestDto;
import com.devansh.service.DisasterZoneService;
import com.devansh.service.SosRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SosRequestServiceImpl implements SosRequestService {

    private final SosRequestRepository sosRepository;
    private final SosRequestMapper sosRequestMapper;
    private final DisasterZoneService disasterZoneService;

    @Override
    public SosRequestDto createSosRequest(CreateSosRequest createSosRequest, User user) {
        SosRequest sosRequest = new SosRequest();

        sosRequest.setUser(user);
        sosRequest.setLatitude(createSosRequest.getLatitude());
        sosRequest.setLongitude(createSosRequest.getLongitude());
        sosRequest.setMessage(createSosRequest.getMessage());
        sosRequest.setDisasterType(createSosRequest.getDisasterType());
        sosRequest.setStatus(SosStatus.PENDING);

        disasterZoneService.findMatchingZone(
                createSosRequest.getLatitude(),
                createSosRequest.getLongitude(),
                createSosRequest.getDisasterType()
        ).ifPresent(sosRequest::setDisasterZone);

        SosRequest savedSos = sosRepository.save(sosRequest);

        return sosRequestMapper.requestToSosRequestDto(savedSos);
    }

    @Override
    public SosRequestDto updatePendingSosRequest(CreateSosRequest createSosRequest, Integer sosRequestId, User user) {
        SosRequest sosRequest = getSosRequestById(sosRequestId);

        if (!sosRequest.getStatus().equals(SosStatus.PENDING)) {
            throw new SosException("Only pending requests can be updated");
        }

        if (!sosRequest.getUser().getId().equals(user.getId())) {
            throw new SosException("You are not allowed to update this request");
        }

        if (createSosRequest.getLatitude() != null || createSosRequest.getLongitude() != null) {
            sosRequest.setLatitude(createSosRequest.getLatitude());
            sosRequest.setLongitude(createSosRequest.getLongitude());

            disasterZoneService.findMatchingZone(
                    createSosRequest.getLatitude(),
                    createSosRequest.getLongitude(),
                    createSosRequest.getDisasterType()
            ).ifPresentOrElse(sosRequest::setDisasterZone,
                    () -> sosRequest.setDisasterZone(null)
            );

        }

        sosRequest.setMessage(createSosRequest.getMessage());
        sosRequest.setDisasterType(createSosRequest.getDisasterType());
        sosRequest.setStatus(SosStatus.PENDING);
        sosRequest.setUpdatedAt(LocalDateTime.now());

        SosRequest savedSos = sosRepository.save(sosRequest);
        return sosRequestMapper.requestToSosRequestDto(savedSos);
    }

    @Override
    public List<SosRequestDto> getAllSosRequests(User user) {
        return sosRepository.findByUserId(user.getId()).stream()
                .map(sosRequestMapper::requestToSosRequestDto)
                .toList();
    }

    @Override
    public MessageResponse deletePendingSosRequest(Integer sosRequestId, User user) {
        SosRequest sosRequest = getSosRequestById(sosRequestId);
        if (!sosRequest.getStatus().equals(SosStatus.PENDING)) {
            throw new SosException("Only pending requests can be deleted");
        }

        if (!sosRequest.getUser().getId().equals(user.getId())) {
            throw new SosException("You are not allowed to update this request");
        }

        sosRepository.delete(sosRequest);
        return new MessageResponse("Request deleted successfully with id " + sosRequestId);
    }

    // admin only

    @Override
    public Page<SosRequestDto> getFilteredRequests(SosStatus status, Integer zoneId, Pageable pageable) {
        Page<SosRequest> sosRequestsPage;

        if (zoneId != null && status != null) {
            sosRequestsPage = sosRepository.findByDisasterZoneIdAndStatus(zoneId, status, pageable);
        } else if (zoneId != null) {
            sosRequestsPage = sosRepository.findByDisasterZoneId(zoneId, pageable);
        } else if (status != null) {
            sosRequestsPage = sosRepository.findByStatus(status, pageable);
        } else {
            sosRequestsPage = sosRepository.findAll(pageable);
        }

        // Chuyển đổi từ Page<Entity> sang Page<Dto>
        return sosRequestsPage.map(sosRequestMapper::requestToSosRequestDto);
    }

    @Override
    public SosRequestDto updateSosStatus(Integer sosRequestId, SosStatus status) {
        SosRequest sosRequest = getSosRequestById(sosRequestId);
        sosRequest.setStatus(status);
        SosRequest savedSos = sosRepository.save(sosRequest);
        return sosRequestMapper.requestToSosRequestDto(savedSos);
    }

    // not for the controller

    private SosRequest getSosRequestById(Integer sosRequestId) {
        return sosRepository
                .findById(sosRequestId)
                .orElseThrow(() -> new SosException("No such SosRequest with id: " + sosRequestId));
    }
}
