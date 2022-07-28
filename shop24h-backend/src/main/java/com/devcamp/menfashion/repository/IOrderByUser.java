package com.devcamp.menfashion.repository;

import java.math.BigDecimal;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public interface IOrderByUser {
	
	public String getOrderCode();
	
	@JsonFormat(pattern = "dd/MM/yyyy")
	public Date getOrderDate();
	
	public String getStatusName();

	public BigDecimal getDiscount();

	public BigDecimal getPriceShipped();

	public BigDecimal getTongTien();
}
