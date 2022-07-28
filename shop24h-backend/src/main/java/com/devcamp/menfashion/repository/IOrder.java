package com.devcamp.menfashion.repository;

import java.math.BigDecimal;

public interface IOrder {
	public long getId();

	public String getOrderDate();

	public String getExpectedShippedDate();

	public String getVoucherCode();

	public BigDecimal getDiscount();

	public BigDecimal getPriceShipped();

	public String getNote();

	public String getOrderCode();

	public String getFullName();

	public long getIdUser();

	public String getStatusName();

}
