package com.devcamp.menfashion.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "permission")
@Getter
@Setter
public class Permission extends BaseEntity {

    private String permissionName;

    private String permissionKey;

	/**
	 * @return the permissionName
	 */
	public String getPermissionName() {
		return permissionName;
	}

	/**
	 * @param permissionName the permissionName to set
	 */
	public void setPermissionName(String permissionName) {
		this.permissionName = permissionName;
	}

	/**
	 * @return the permissionKey
	 */
	public String getPermissionKey() {
		return permissionKey;
	}

	/**
	 * @param permissionKey the permissionKey to set
	 */
	public void setPermissionKey(String permissionKey) {
		this.permissionKey = permissionKey;
	}

}
