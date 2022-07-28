package com.devcamp.menfashion.controller;

import java.util.*;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.devcamp.menfashion.model.*;
import com.devcamp.menfashion.repository.*;

@RestController
@CrossOrigin
@RequestMapping("/")
public class ReplyRateController {

	@Autowired
	IReplyRateRepository gReplyRateRepository;

	@Autowired
	private IUserRepositoty gUserRepositoty;

	@Autowired
	IRateRepository gRateRepository;

	/**
	 * function get info ReplyRates By RateId
	 * 
	 * @param rateId
	 * @return get info ReplyRates
	 */
	@GetMapping("/reply-rates")
	public ResponseEntity<List<ReplyRate>> getReplyRatesByRateId(@RequestParam Long rateId) {
		try {
			List<ReplyRate> vRates = gReplyRateRepository.findByRateId(rateId);
			return new ResponseEntity<>(vRates, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function create ReplyRate
	 * 
	 * @param userId
	 * @param rateId
	 * @param pReplyRate
	 * @return create ReplyRate success
	 */
	@PostMapping("/reply-rates/{userId}/{rateId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> createReplyRate(@PathVariable Long userId, @PathVariable Long rateId,
			@Valid @RequestBody ReplyRate pReplyRate) {
		try {
			Optional<User> vOptionalUser = gUserRepositoty.findById(userId);
			Optional<Rate> vOptionalRate = gRateRepository.findById(rateId);
			if (vOptionalUser.isPresent() || vOptionalRate.isPresent()) {
				ReplyRate vReplyRate = new ReplyRate();
				vReplyRate.setReCommentDate(new Date());
				vReplyRate.setReCommnent(pReplyRate.getReCommnent());
				vReplyRate.setRate(vOptionalRate.get());
				vReplyRate.setUser(vOptionalUser.get());
				ReplyRate vReplyRateSave = gReplyRateRepository.save(vReplyRate);
				return new ResponseEntity<>(vReplyRateSave, HttpStatus.CREATED);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(e.getCause().getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function update ReplyRate
	 * 
	 * @param id
	 * @param userId
	 * @param rateId
	 * @param pReplyRate
	 * @return update ReplyRate success
	 */
	@PutMapping("/reply-rates/{id}/{userId}/{rateId}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> updateReplyRate(@PathVariable Long id, @PathVariable Long userId,
			@PathVariable Long rateId, @Valid @RequestBody ReplyRate pReplyRate) {
		try {
			Optional<ReplyRate> vOptionalReplyRate = gReplyRateRepository.findById(id);
			Optional<User> vOptionalUser = gUserRepositoty.findById(userId);
			Optional<Rate> vOptionalRate = gRateRepository.findById(rateId);
			if (vOptionalReplyRate.isPresent() || vOptionalUser.isPresent() || vOptionalRate.isPresent()) {
				ReplyRate vReplyRate = vOptionalReplyRate.get();
				vReplyRate.setReCommentDate(new Date());
				vReplyRate.setReCommnent(pReplyRate.getReCommnent());
				vReplyRate.setRate(vOptionalRate.get());
				vReplyRate.setUser(vOptionalUser.get());
				ReplyRate vReplyRateSave = gReplyRateRepository.save(vReplyRate);
				return new ResponseEntity<>(vReplyRateSave, HttpStatus.OK);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(e.getCause().getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * function delete ReplyRate
	 * 
	 * @param id
	 * @return delete ReplyRate success
	 */
	@DeleteMapping("/reply-rates/{id}")
	@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_STAFF')")
	public ResponseEntity<Object> deleteReplyRate(@PathVariable Long id) {
		try {
			Optional<ReplyRate> vOptionalReplyRate = gReplyRateRepository.findById(id);
			if (vOptionalReplyRate.isPresent()) {
				gReplyRateRepository.deleteById(id);
				return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
			} else {
				return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
			}

		} catch (Exception e) {
			return new ResponseEntity<>(e.getCause().getCause().getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
