package com.devcamp.menfashion.model;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.*;
import javax.validation.constraints.DecimalMin;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "orders")
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(name = "order_code", unique = true)
	private String orderCode;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "order_date", nullable = false, updatable = false)
	@CreatedDate
	@JsonFormat(pattern = "dd/MM/yyyy")
	private Date orderDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "expected_shipped_date", nullable = false)
	@LastModifiedDate
	@JsonFormat(pattern = "dd/MM/yyyy")
	private Date expectedShippedDate;

	@Column(name = "voucher_code")
	private String voucherCode;

	@DecimalMin(value = "0.0", inclusive = true, message = "Input discount >= 0")
	private BigDecimal discount;

	@DecimalMin(value = "0.0", inclusive = true, message = "Input price shipped >= 0")
	@Column(name = "price_shipped")
	private BigDecimal priceShipped;

	private String note;

	@ManyToOne
	@JoinColumn(name = "status_id", nullable = false)
	@JsonIgnore
	private Status status;

	@Transient
	private String statusName;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	@JsonIgnore
	private User user;

	@Transient
	private String fullName;

	@Transient
	private long idUser;

	public Order() {

	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Date getOrderDate() {
		return orderDate;
	}

	public void setOrderDate(Date orderDate) {
		this.orderDate = orderDate;
	}

	public Date getExpectedShippedDate() {
		return expectedShippedDate;
	}

	public void setExpectedShippedDate(Date expectedShippedDate) {
		this.expectedShippedDate = expectedShippedDate;
	}

	public String getVoucherCode() {
		return voucherCode;
	}

	public void setVoucherCode(String voucherCode) {
		this.voucherCode = voucherCode;
	}

	public BigDecimal getDiscount() {
		return discount;
	}

	public void setDiscount(BigDecimal discount) {
		this.discount = discount;
	}

	public BigDecimal getPriceShipped() {
		return priceShipped;
	}

	public void setPriceShipped(BigDecimal priceShipped) {
		this.priceShipped = priceShipped;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public String getStatusName() {
		return getStatus().getStatusName();
	}

	public void setStatusName(String statusName) {
		this.statusName = statusName;
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

	public long getIdUser() {
		return getUser().getId();
	}

	public void setIdUser(long idUser) {
		this.idUser = idUser;
	}

	public String getOrderCode() {
		return orderCode;
	}

	public void setOrderCode(String orderCode) {
		this.orderCode = orderCode;
	}

}
