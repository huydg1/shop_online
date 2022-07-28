package com.devcamp.menfashion.model;

import java.util.Date;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;

import org.springframework.data.annotation.CreatedDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "reply_rates")
public class ReplyRate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotEmpty(message = "Input re_comment")
	@Column(name = "re_comment")
	private String reCommnent;

	@ManyToOne
	@JoinColumn(name = "rate_id", nullable = false)
	@JsonIgnore
	private Rate rate;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	@Transient
	private String fullName;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "re_comment_date", nullable = false, updatable = false)
	@CreatedDate
	@JsonFormat(pattern = "dd/MM/yyyy")
	private Date reCommentDate;

	public ReplyRate() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getReCommnent() {
		return reCommnent;
	}

	public void setReCommnent(String reCommnent) {
		this.reCommnent = reCommnent;
	}

	public Rate getRate() {
		return rate;
	}

	public void setRate(Rate rate) {
		this.rate = rate;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Date getReCommentDate() {
		return reCommentDate;
	}

	public void setReCommentDate(Date reCommentDate) {
		this.reCommentDate = reCommentDate;
	}

	public String getFullName() {
		return getUser().getFullName();
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

}
