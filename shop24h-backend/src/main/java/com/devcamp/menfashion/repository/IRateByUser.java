package com.devcamp.menfashion.repository;

import java.math.BigDecimal;

public interface IRateByUser {

	public Long getId();

	public String getImageUrl();

	public String getProductName();

	public String getComment();

	public BigDecimal getRate();

	public String getStatusRate();

}
