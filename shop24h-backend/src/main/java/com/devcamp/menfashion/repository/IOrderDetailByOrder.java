package com.devcamp.menfashion.repository;

import java.math.BigDecimal;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public interface IOrderDetailByOrder {

	public String getOrderCode();

	@JsonFormat(pattern = "dd/MM/yyyy")
	public Date getDate();

	public String getImageUrl();

	public String getProduct();

	public long getProductId();

	public String getColor();

	public int getQuantity();

	public BigDecimal getPrice();

	public BigDecimal getThanhTien();

	public String getVoucherCode();

	public BigDecimal getDiscount();

	public BigDecimal getPriceShipped();

	public String getFullName();

	public String getEmail();

	public String getPhone();

	public String getAddress();

	public String getNote();
}
