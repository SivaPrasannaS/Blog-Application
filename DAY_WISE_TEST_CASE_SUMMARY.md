# Day-Wise Test Case Summary Table

| Day | Test Case Name | Type (FE/BE) | Description |
| --- | --- | --- | --- |
| 4 | day_4_register_valid_data_returns_created | BE | Verifies that registration with valid data returns a created response and tokens. |
| 4 | day_4_register_duplicate_username_returns_conflict | BE | Verifies that duplicate usernames are rejected with a conflict response. |
| 4 | day_4_register_duplicate_email_returns_conflict | BE | Verifies that duplicate email registration attempts are rejected with a conflict response. |
| 4 | day_4_register_invalid_password_returns_unprocessable_entity | BE | Verifies that weak passwords fail validation during registration. |
| 4 | day_4_login_valid_credentials_returns_tokens | BE | Verifies that valid login credentials return access and refresh tokens. |
| 4 | day_4_login_wrong_password_returns_unauthorized | BE | Verifies that an incorrect password returns an unauthorized response. |
| 4 | day_4_refresh_valid_token_returns_new_tokens | BE | Verifies that a valid refresh token returns renewed tokens. |
| 4 | day_4_refresh_access_token_returns_unauthorized | BE | Verifies that an access token cannot be used as a refresh token. |
| 4 | day_4_list_categories_authenticated_returns_created_category | BE | Verifies that authenticated users can list categories and see created categories. |
| 4 | day_4_create_category_manager_returns_created | BE | Verifies that a manager can create a category successfully. |
| 4 | day_4_create_category_invalid_payload_returns_unprocessable_entity | BE | Verifies that invalid category payloads fail validation. |
| 4 | day_4_update_category_admin_returns_ok | BE | Verifies that an admin can update a category successfully. |
| 4 | day_4_delete_category_admin_returns_no_content | BE | Verifies that an admin can delete a category successfully. |
| 4 | day_4_delete_category_missing_id_returns_not_found | BE | Verifies that deleting a missing category returns not found. |
| 4 | day_4_get_published_post_unauthenticated_returns_ok | BE | Verifies that published posts can be viewed without authentication. |
| 4 | day_4_get_draft_post_owner_returns_ok | BE | Verifies that a draft post owner can view their own draft. |
| 4 | day_4_create_post_user_forces_draft | BE | Verifies that regular users are forced to create posts as drafts. |
| 4 | day_4_create_post_manager_can_publish | BE | Verifies that a manager can create a published post directly. |
| 4 | day_4_create_post_invalid_payload_returns_unprocessable_entity | BE | Verifies that invalid post payloads fail validation. |
| 4 | day_4_update_post_owner_forces_draft | BE | Verifies that a regular owner cannot elevate a draft to published on update. |
| 4 | day_4_update_post_manager_can_publish | BE | Verifies that a manager can update and publish a draft post. |
| 4 | day_4_publish_post_manager_returns_published | BE | Verifies that a manager can publish a draft post. |
| 4 | day_4_publish_post_admin_can_unpublish | BE | Verifies that an admin can revert a published post back to draft. |
| 4 | day_4_delete_post_owner_returns_ok | BE | Verifies that a post owner can delete their own post. |
| 4 | day_4_delete_post_admin_returns_ok | BE | Verifies that an admin can delete any post. |
| 4 | day_4_get_all_users_admin_returns_registered_user_and_excludes_admin | BE | Verifies that the admin user list includes managed users and excludes the admin account. |
| 4 | day_4_assign_role_admin_returns_updated_roles | BE | Verifies that an admin can update a user's role successfully. |
| 4 | day_4_assign_role_invalid_payload_returns_unprocessable_entity | BE | Verifies that invalid role assignment payloads fail validation. |
| 4 | day_4_deactivate_user_admin_returns_inactive_user | BE | Verifies that an admin can deactivate a user account successfully. |
| 4 | day_4_audit_logs_admin_returns_recent_entries | BE | Verifies that audit log entries are returned for admin users. |
| 4 | day_4_get_summary_manager_returns_counts | BE | Verifies that analytics summary returns category, post, and user counts. |
| 4 | day_4_get_monthly_manager_returns_current_month_data | BE | Verifies that monthly analytics includes current month posting data. |
| 5 | day_5_login_deactivated_user_returns_unauthorized | BE | Verifies that deactivated users cannot log in. |
| 5 | day_5_list_categories_unauthenticated_returns_unauthorized | BE | Verifies that unauthenticated category access is blocked. |
| 5 | day_5_create_category_user_returns_forbidden | BE | Verifies that regular users cannot create categories. |
| 5 | day_5_get_draft_post_other_user_returns_forbidden | BE | Verifies that non-owners cannot view another user's draft post. |
| 5 | day_5_create_post_unauthenticated_returns_unauthorized | BE | Verifies that unauthenticated users cannot create posts. |
| 5 | day_5_update_post_outsider_returns_forbidden | BE | Verifies that unauthorized users cannot update someone else's post. |
| 5 | day_5_publish_post_user_returns_forbidden | BE | Verifies that regular users cannot publish posts. |
| 5 | day_5_delete_post_outsider_returns_forbidden | BE | Verifies that unauthorized users cannot delete another user's post. |
| 5 | day_5_get_all_users_manager_returns_forbidden | BE | Verifies that managers cannot access admin-only user listing endpoints. |
| 5 | day_5_audit_logs_user_returns_forbidden | BE | Verifies that regular users cannot access audit logs. |
| 5 | day_5_get_summary_user_returns_forbidden | BE | Verifies that regular users cannot access analytics summary data. |
| 5 | day_5_get_monthly_unauthenticated_returns_unauthorized | BE | Verifies that unauthenticated monthly analytics access is blocked. |
| 7 | day_7_renders_login_fields | FE | Verifies that the login page renders the expected input fields. |
| 7 | day_7_empty_submit_shows_validation_errors | FE | Verifies that submitting an empty login form shows validation errors. |
| 7 | day_7_short_password_shows_error | FE | Verifies that short passwords show validation feedback on login. |
| 7 | day_7_eye_icon_toggles_password_visibility | FE | Verifies that the password visibility toggle changes the password field type. |
| 7 | day_7_manager_shows_status_dropdown | FE | Verifies that managers can see the post status dropdown in the form. |
| 7 | day_7_user_hides_status_dropdown | FE | Verifies that regular users do not see the post status dropdown. |
| 7 | day_7_short_title_shows_error | FE | Verifies that short post titles show validation errors. |
| 7 | day_7_short_body_shows_error | FE | Verifies that short post bodies show validation errors. |
| 8 | day_8_login_fulfilled_sets_user_and_token | FE | Verifies that successful login fulfillment stores the user and access token. |
| 8 | day_8_login_rejected_sets_error | FE | Verifies that failed login state stores an error message. |
| 8 | day_8_logout_clears_all | FE | Verifies that logout clears user and token state. |
| 8 | day_8_create_post_fulfilled_updates_selected_only | FE | Verifies that post creation updates selected state without mutating the list directly. |
| 8 | day_8_publish_post_fulfilled_updates_selected_and_list_immediately | FE | Verifies that publish fulfillment updates both selected post state and listing state immediately. |
| 8 | day_8_dispatches_login_async_with_correct_credentials | FE | Verifies that the login page dispatches the async login action with the submitted credentials. |
| 8 | day_8_success_redirects_to_posts | FE | Verifies that successful login redirects the user to the posts page. |
| 8 | day_8_login_401_shows_error_banner | FE | Verifies that login errors are shown as an error banner. |
| 8 | day_8_user_submit_sets_status_to_draft | FE | Verifies that regular user post submission is forced to draft status. |
| 8 | day_8_manager_submit_sets_status_to_published | FE | Verifies that manager post submission can keep published status. |
| 8 | day_8_edit_mode_prefills_fields | FE | Verifies that post edit mode pre-fills the existing form values. |
| 8 | day_8_post_create_is_true_for_user | FE | Verifies that RBAC allows users to create posts. |
| 8 | day_8_post_publish_is_false_for_user | FE | Verifies that RBAC blocks users from publishing posts. |
| 8 | day_8_post_publish_is_true_for_manager | FE | Verifies that RBAC allows managers to publish posts. |
| 8 | day_8_user_manage_is_false_for_manager | FE | Verifies that RBAC blocks managers from admin user management. |
| 8 | day_8_user_manage_is_true_for_admin | FE | Verifies that RBAC allows admins to manage users. |
| 8 | day_8_can_edit_post_is_true_for_owner | FE | Verifies that post owners can edit their own posts. |
| 8 | day_8_can_edit_post_is_true_for_manager_non_owner | FE | Verifies that managers can edit posts they do not own. |
| 8 | day_8_can_delete_post_is_false_for_manager_others | FE | Verifies that managers cannot delete other users' posts by default. |
| 8 | day_8_can_delete_post_is_true_for_admin | FE | Verifies that admins can delete any post. |
| 8 | day_8_role_guard_has_permission_renders | FE | Verifies that RoleGuard renders protected content when permission is granted. |
| 8 | day_8_role_guard_no_permission_shows_fallback | FE | Verifies that RoleGuard shows fallback content when permission is missing. |
| 8 | day_8_role_guard_user_owner_shows_edit | FE | Verifies that RoleGuard allows owners to access edit actions. |
| 8 | day_8_role_guard_manager_others_post_hides_delete | FE | Verifies that RoleGuard hides delete actions for managers on others' posts. |
| 8 | day_8_role_guard_admin_shows_all | FE | Verifies that RoleGuard allows admins to access privileged content. |
| 8 | day_8_protected_route_unauth_redirects_login | FE | Verifies that ProtectedRoute redirects unauthenticated users to login. |
| 8 | day_8_protected_route_no_permission_redirects_unauthorized | FE | Verifies that ProtectedRoute redirects unauthorized users to the unauthorized page. |
| 8 | day_8_protected_route_has_permission_renders | FE | Verifies that ProtectedRoute renders content when permission is present. |
| 8 | day_8_register_login_protected_route_success | FE | Verifies that the register-to-login flow grants access to a protected route. |
| 8 | day_8_expired_token_refresh_retry_succeeds | FE | Verifies that token refresh updates the access token successfully. |
| 8 | day_8_refresh_fail_logout_redirects_login | FE | Verifies that refresh failure leads to logout and login redirection behavior. |
| 8 | day_8_logout_clears_storage_and_redirects_login | FE | Verifies that logout clears stored tokens and ends the authenticated session. |
| 9 | day_9_list_posts_returns_published_posts_and_supports_filters | BE | Verifies that published post listing supports filtering and returns matching posts. |
| 9 | day_9_list_draft_posts_manager_returns_only_draft_posts | BE | Verifies that managers can fetch only draft posts from the draft endpoint. |
| 9 | day_9_list_draft_posts_user_returns_forbidden | BE | Verifies that regular users cannot access the draft posts endpoint. |
| 9 | day_9_publish_post_fulfilled_moves_draft_into_published_table_state | FE | Verifies that publishing a draft moves it from draft state into the published list state. |
| 9 | day_9_manager_draft_shows_publish_draft_button | FE | Verifies that managers see the publish draft action on draft post detail pages. |
| 9 | day_9_publish_draft_dispatches_publish_async | FE | Verifies that the publish draft button dispatches the publish action. |
| 9 | day_9_manager_sees_separate_draft_posts_table | FE | Verifies that managers see a separate draft posts table alongside published posts. |
| 9 | day_9_publish_from_draft_table_dispatches_publish_async | FE | Verifies that publishing from the draft table dispatches the correct publish action. |
| 10 | day_10_invalid_date_returns_fallback | FE | Verifies that invalid date values render a safe fallback instead of breaking the UI. |
| 10 | day_10_posts_new_route_has_single_active_tab | FE | Verifies that the New Post sidebar route marks only one tab as active. |
| 10 | day_10_post_detail_route_keeps_posts_as_single_active_tab | FE | Verifies that the post detail route keeps the Posts tab as the only active sidebar item. |
| 11 | day_11_assign_role_admin_role_returns_bad_request | BE | Verifies that assigning the admin role through user management is rejected. |
| 11 | day_11_assign_role_cannot_modify_admin_returns_bad_request | BE | Verifies that admin accounts cannot be modified through role assignment. |
| 11 | day_11_deactivate_self_returns_bad_request | BE | Verifies that admins cannot deactivate their own account. |
| 11 | day_11_filters_admin_user_and_hides_admin_role_option | FE | Verifies that the user management UI hides admin accounts and the admin role option. |
| 11 | day_11_role_change_only_allows_user_or_manager | FE | Verifies that the role change UI only offers user and manager role options. |