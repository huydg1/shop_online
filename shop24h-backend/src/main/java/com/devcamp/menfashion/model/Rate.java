package com.devcamp.menfashion.model;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;

import org.springframework.data.annotation.CreatedDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "rates")
public class Rate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotEmpty(message = "Input comment")
	private String comment;

	private BigDecimal rate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "comment_date", nullable = false, updatable = false)
	@CreatedDate
	@JsonFormat(pattern = "dd/MM/yyyy")
	private Date commentDate;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	@Transient
	private String fullName;

	@ManyToOne
	@JoinColumn(name = "status_rate_id", nullable = false)
	@JsonIgnore
	private StatusRate statusRate;

	@Transient
	private String statusRateName;

	@Transient
	private long idStatusRate;

	@ManyToOne
	@JoinColumn(name = "product_id", nullable = false)
	@JsonIgnore
	private Product product;

	@Transient
	private String productName;

	@OneToMany(mappedBy = "rate")
//	@JsonIgnore
	private List<ReplyRate> replyRates;

	public Rate() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public BigDecimal getRate() {
		return rate;
	}

	public void setRate(BigDecimal rate) {
		this.rate = rate;
	}

	public Date getCommentDate() {
		return commentDate;
	}

	public void setCommentDate(Date commentDate) {
		this.commentDate = commentDate;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getFullName() {
		return getUser().getFullName();
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public List<ReplyRate> getReplyRates() {
		return replyRates;
	}

	public void setReplyRates(List<ReplyRate> replyRates) {
		this.replyRates = replyRates;
	}

	public StatusRate getStatusRate() {
		return statusRate;
	}

	public void setStatusRate(StatusRate statusRate) {
		this.statusRate = statusRate;
	}

	public String getStatusRateName() {
		return getStatusRate().getStatusRateName();
	}

	public void setStatusRateName(String statusRateName) {
		this.statusRateName = statusRateName;
	}

	public long getIdStatusRate() {
		return getStatusRate().getId();
	}

	public void setIdStatusRate(long idStatusRate) {
		this.idStatusRate = idStatusRate;
	}

	public String getProductName() {
		return getProduct().getProductName();
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

}
