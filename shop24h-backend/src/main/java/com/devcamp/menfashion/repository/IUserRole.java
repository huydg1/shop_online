package com.devcamp.menfashion.repository;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public interface IUserRole {

	public long getId();

	public String getFullName();

	public String getPhone();

	public String getEmail();

	public String getAddress();

	public String getGender();

	@JsonFormat(pattern = "dd/MM/yyyy")
	public Date getBirthday();

	public int getHeight();

	public int getWeight();

	public long getRoleId();
}
