package com.devcamp.menfashion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devcamp.menfashion.model.ReplyRate;

public interface IReplyRateRepository extends JpaRepository<ReplyRate, Long> {

	List<ReplyRate> findByRateId(Long rateId);
}
