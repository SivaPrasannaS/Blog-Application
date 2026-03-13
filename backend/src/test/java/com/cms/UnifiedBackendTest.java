package com.cms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.YearMonth;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class UnifiedBackendTest {

    private static final String DEFAULT_PASSWORD = "Password@123";
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "Admin@123";
    private static final String VALID_POST_BODY = "This body contains more than twenty characters for endpoint validation.";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Nested
    class AuthControllerTests {

        @Test
        void day_4_register_valid_data_returns_created() throws Exception {
            String username = uniqueValue("writer");

            MvcResult result = postJson(
                    "/api/auth/register",
                    null,
                    Map.of(
                            "username", username,
                            "email", username + "@example.com",
                            "password", DEFAULT_PASSWORD
                    )
            ).andExpect(status().isCreated()).andReturn();

            JsonNode body = readJson(result);
            assertEquals(username, body.path("user").path("username").asText());
            assertFalse(body.path("token").asText().isBlank());
            assertFalse(body.path("refreshToken").asText().isBlank());
        }

        @Test
        void day_4_register_duplicate_username_returns_conflict() throws Exception {
            String username = uniqueValue("duplicate-user");
            registerUser(username, username + "@example.com", DEFAULT_PASSWORD);

            postJson(
                    "/api/auth/register",
                    null,
                    Map.of(
                            "username", username,
                            "email", uniqueValue("new-mail") + "@example.com",
                            "password", DEFAULT_PASSWORD
                    )
            ).andExpect(status().isConflict());
        }

        @Test
        void day_4_register_duplicate_email_returns_conflict() throws Exception {
            String existingEmail = uniqueValue("duplicate-email") + "@example.com";
            registerUser(uniqueValue("first-user"), existingEmail, DEFAULT_PASSWORD);

            postJson(
                    "/api/auth/register",
                    null,
                    Map.of(
                            "username", uniqueValue("second-user"),
                            "email", existingEmail,
                            "password", DEFAULT_PASSWORD
                    )
            ).andExpect(status().isConflict());
        }

        @Test
        void day_4_register_invalid_password_returns_unprocessable_entity() throws Exception {
            String username = uniqueValue("weak-user");

            MvcResult result = postJson(
                    "/api/auth/register",
                    null,
                    Map.of(
                            "username", username,
                            "email", username + "@example.com",
                            "password", "weak"
                    )
            ).andExpect(status().isUnprocessableEntity()).andReturn();

            assertTrue(readJson(result).path("fieldErrors").has("password"));
        }

        @Test
        void day_4_login_valid_credentials_returns_tokens() throws Exception {
            TestUser user = registerUser();

            MvcResult result = postJson(
                    "/api/auth/login",
                    null,
                    Map.of(
                            "username", user.username(),
                            "password", DEFAULT_PASSWORD
                    )
            ).andExpect(status().isOk()).andReturn();

            JsonNode body = readJson(result);
            assertEquals(user.username(), body.path("user").path("username").asText());
            assertFalse(body.path("token").asText().isBlank());
            assertFalse(body.path("refreshToken").asText().isBlank());
        }

        @Test
        void day_4_login_wrong_password_returns_unauthorized() throws Exception {
            TestUser user = registerUser();

            postJson(
                    "/api/auth/login",
                    null,
                    Map.of(
                            "username", user.username(),
                            "password", "Wrong@123"
                    )
            ).andExpect(status().isUnauthorized());
        }

        @Test
        void day_5_login_deactivated_user_returns_unauthorized() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser user = registerUser();
            deactivateUser(admin.token(), user.id())
                    .andExpect(status().isOk());

            postJson(
                    "/api/auth/login",
                    null,
                    Map.of(
                            "username", user.username(),
                            "password", DEFAULT_PASSWORD
                    )
            ).andExpect(status().isUnauthorized());
        }

        @Test
        void day_4_refresh_valid_token_returns_new_tokens() throws Exception {
            TestUser user = registerUser();

            MvcResult result = postJson(
                    "/api/auth/refresh",
                    null,
                    Map.of("refreshToken", user.refreshToken())
            ).andExpect(status().isOk()).andReturn();

            JsonNode body = readJson(result);
            assertFalse(body.path("token").asText().isBlank());
            assertFalse(body.path("refreshToken").asText().isBlank());
        }

        @Test
        void day_4_refresh_access_token_returns_unauthorized() throws Exception {
            TestUser user = registerUser();

            postJson(
                    "/api/auth/refresh",
                    null,
                    Map.of("refreshToken", user.token())
            ).andExpect(status().isUnauthorized());
        }

    }

    @Nested
    class CategoryControllerTests {

        @Test
        void day_4_list_categories_authenticated_returns_created_category() throws Exception {
            TestUser manager = createManager();
            TestUser user = registerUser();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("category-list"));

            MvcResult result = getJson("/api/categories", user.token())
                    .andExpect(status().isOk())
                    .andReturn();

                        assertTrue(result.getResponse().getContentAsString().contains(category.name()));
        }

        @Test
        void day_5_list_categories_unauthenticated_returns_unauthorized() throws Exception {
            getJson("/api/categories", null)
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void day_4_create_category_manager_returns_created() throws Exception {
            TestUser manager = createManager();
            String name = uniqueValue("category-create");

            MvcResult result = postJson(
                    "/api/categories",
                    manager.token(),
                    Map.of(
                            "name", name,
                            "description", "Manager created category"
                    )
            ).andExpect(status().isCreated()).andReturn();

            JsonNode body = readJson(result);
            assertEquals(name, body.path("name").asText());
            assertTrue(body.path("id").asLong() > 0);
        }

        @Test
        void day_5_create_category_user_returns_forbidden() throws Exception {
            TestUser user = registerUser();

            postJson(
                    "/api/categories",
                    user.token(),
                    Map.of(
                            "name", uniqueValue("category-forbidden"),
                            "description", "Regular user cannot create categories"
                    )
            ).andExpect(status().isForbidden());
        }

        @Test
        void day_4_create_category_invalid_payload_returns_unprocessable_entity() throws Exception {
            TestUser manager = createManager();

            MvcResult result = postJson(
                    "/api/categories",
                    manager.token(),
                    Map.of(
                            "name", "",
                            "description", "Too short name should fail"
                    )
            ).andExpect(status().isUnprocessableEntity()).andReturn();

            assertTrue(readJson(result).path("fieldErrors").has("name"));
        }

        @Test
        void day_4_update_category_admin_returns_ok() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("category-update"));
            String updatedName = uniqueValue("updated-category");

            MvcResult result = putJson(
                    "/api/categories/" + category.id(),
                    admin.token(),
                    Map.of(
                            "name", updatedName,
                            "description", "Updated description"
                    )
            ).andExpect(status().isOk()).andReturn();

            assertEquals(updatedName, readJson(result).path("name").asText());
        }

        @Test
        void day_4_delete_category_admin_returns_no_content() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("category-delete"));

            deleteJson("/api/categories/" + category.id(), admin.token())
                    .andExpect(status().isNoContent());
        }

        @Test
        void day_4_delete_category_missing_id_returns_not_found() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);

            deleteJson("/api/categories/999999", admin.token())
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class PostControllerTests {

        @Test
        void day_9_list_posts_returns_published_posts_and_supports_filters() throws Exception {
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("post-filter-category"));
            String title = uniqueValue("published-post");
            createPost(manager.token(), title, VALID_POST_BODY, category.id(), "PUBLISHED");

            MvcResult result = getJson(
                    "/api/posts?size=100&categoryId=" + category.id() + "&month=" + YearMonth.now().getMonthValue(),
                    null
            ).andExpect(status().isOk()).andReturn();

            JsonNode content = readJson(result).path("content");
            assertTrue(arrayContainsFieldValue(content, "title", title));
        }

                @Test
                void day_9_list_draft_posts_manager_returns_only_draft_posts() throws Exception {
                        TestUser manager = createManager();
                        CategoryInfo category = createCategory(manager.token(), uniqueValue("draft-list-category"));
                        String draftTitle = uniqueValue("draft-only-post");
                        createPost(manager.token(), draftTitle, VALID_POST_BODY, category.id(), "DRAFT");
                        createPost(manager.token(), uniqueValue("published-for-draft-list"), VALID_POST_BODY, category.id(), "PUBLISHED");

                        MvcResult result = getJson("/api/posts/drafts", manager.token())
                                        .andExpect(status().isOk())
                                        .andReturn();

                        JsonNode body = readJson(result);
                        assertTrue(arrayContainsFieldValue(body, "title", draftTitle));
                        assertFalse(arrayContainsFieldValue(body, "status", "PUBLISHED"));
                }

                @Test
                void day_9_list_draft_posts_user_returns_forbidden() throws Exception {
                        TestUser user = registerUser();

                        getJson("/api/posts/drafts", user.token())
                                        .andExpect(status().isForbidden());
                }

        @Test
        void day_4_get_published_post_unauthenticated_returns_ok() throws Exception {
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("post-public-category"));
            PostInfo post = createPost(manager.token(), uniqueValue("public-post"), VALID_POST_BODY, category.id(), "PUBLISHED");

            MvcResult result = getJson("/api/posts/" + post.id(), null)
                    .andExpect(status().isOk())
                    .andReturn();

            assertEquals("PUBLISHED", readJson(result).path("status").asText());
        }

        @Test
        void day_4_get_draft_post_owner_returns_ok() throws Exception {
            TestUser owner = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("draft-owner-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("owner-draft"), VALID_POST_BODY, category.id(), "DRAFT");

            getJson("/api/posts/" + post.id(), owner.token())
                    .andExpect(status().isOk());
        }

        @Test
        void day_5_get_draft_post_other_user_returns_forbidden() throws Exception {
            TestUser owner = registerUser();
            TestUser otherUser = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("draft-forbidden-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("other-draft"), VALID_POST_BODY, category.id(), "DRAFT");

            getJson("/api/posts/" + post.id(), otherUser.token())
                    .andExpect(status().isForbidden());
        }

        @Test
        void day_4_create_post_user_forces_draft() throws Exception {
            TestUser user = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("create-draft-category"));

            MvcResult result = postJson(
                    "/api/posts",
                    user.token(),
                    Map.of(
                            "title", uniqueValue("requested-published"),
                            "body", VALID_POST_BODY,
                            "categoryId", category.id(),
                            "status", "PUBLISHED"
                    )
            ).andExpect(status().isCreated()).andReturn();

            assertEquals("DRAFT", readJson(result).path("status").asText());
        }

        @Test
        void day_4_create_post_manager_can_publish() throws Exception {
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("create-published-category"));

            MvcResult result = postJson(
                    "/api/posts",
                    manager.token(),
                    Map.of(
                            "title", uniqueValue("manager-published"),
                            "body", VALID_POST_BODY,
                            "categoryId", category.id(),
                            "status", "PUBLISHED"
                    )
            ).andExpect(status().isCreated()).andReturn();

            assertEquals("PUBLISHED", readJson(result).path("status").asText());
        }

        @Test
        void day_5_create_post_unauthenticated_returns_unauthorized() throws Exception {
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("create-unauth-category"));

            postJson(
                    "/api/posts",
                    null,
                    Map.of(
                            "title", uniqueValue("unauth-post"),
                            "body", VALID_POST_BODY,
                            "categoryId", category.id(),
                            "status", "DRAFT"
                    )
            ).andExpect(status().isUnauthorized());
        }

        @Test
        void day_4_create_post_invalid_payload_returns_unprocessable_entity() throws Exception {
            TestUser user = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("invalid-post-category"));

            MvcResult result = postJson(
                    "/api/posts",
                    user.token(),
                    Map.of(
                            "title", "",
                            "body", "short",
                            "categoryId", category.id(),
                            "status", "DRAFT"
                    )
            ).andExpect(status().isUnprocessableEntity()).andReturn();

            JsonNode body = readJson(result).path("fieldErrors");
            assertTrue(body.has("title"));
            assertTrue(body.has("body"));
        }

        @Test
        void day_4_update_post_owner_forces_draft() throws Exception {
            TestUser owner = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("owner-update-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("owner-update-post"), VALID_POST_BODY, category.id(), "DRAFT");

            MvcResult result = putJson(
                    "/api/posts/" + post.id(),
                    owner.token(),
                    Map.of(
                            "title", uniqueValue("owner-updated-title"),
                            "body", VALID_POST_BODY + " Updated.",
                            "categoryId", category.id(),
                            "status", "PUBLISHED"
                    )
            ).andExpect(status().isOk()).andReturn();

            assertEquals("DRAFT", readJson(result).path("status").asText());
        }

        @Test
        void day_4_update_post_manager_can_publish() throws Exception {
            TestUser owner = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("manager-update-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("manager-update-post"), VALID_POST_BODY, category.id(), "DRAFT");

            MvcResult result = putJson(
                    "/api/posts/" + post.id(),
                    manager.token(),
                    Map.of(
                            "title", uniqueValue("manager-updated-title"),
                            "body", VALID_POST_BODY + " Manager updated.",
                            "categoryId", category.id(),
                            "status", "PUBLISHED"
                    )
            ).andExpect(status().isOk()).andReturn();

            assertEquals("PUBLISHED", readJson(result).path("status").asText());
        }

        @Test
        void day_5_update_post_outsider_returns_forbidden() throws Exception {
            TestUser owner = registerUser();
            TestUser outsider = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("outsider-update-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("outsider-update-post"), VALID_POST_BODY, category.id(), "DRAFT");

            putJson(
                    "/api/posts/" + post.id(),
                    outsider.token(),
                    Map.of(
                            "title", uniqueValue("outsider-updated-title"),
                            "body", VALID_POST_BODY + " Outsider attempt.",
                            "categoryId", category.id(),
                            "status", "DRAFT"
                    )
            ).andExpect(status().isForbidden());
        }

        @Test
        void day_4_publish_post_manager_returns_published() throws Exception {
            TestUser user = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("publish-manager-category"));
            PostInfo post = createPost(user.token(), uniqueValue("publish-manager-post"), VALID_POST_BODY, category.id(), "DRAFT");

            MvcResult result = patchJson("/api/posts/" + post.id() + "/publish", manager.token())
                    .andExpect(status().isOk())
                    .andReturn();

            assertEquals("PUBLISHED", readJson(result).path("status").asText());
        }

        @Test
        void day_4_publish_post_admin_can_unpublish() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("publish-admin-category"));
            PostInfo post = createPost(manager.token(), uniqueValue("publish-admin-post"), VALID_POST_BODY, category.id(), "PUBLISHED");

            MvcResult result = patchJson("/api/posts/" + post.id() + "/publish?published=false", admin.token())
                    .andExpect(status().isOk())
                    .andReturn();

            assertEquals("DRAFT", readJson(result).path("status").asText());
        }

        @Test
        void day_5_publish_post_user_returns_forbidden() throws Exception {
            TestUser user = registerUser();
            TestUser owner = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("publish-forbidden-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("publish-forbidden-post"), VALID_POST_BODY, category.id(), "DRAFT");

            patchJson("/api/posts/" + post.id() + "/publish", user.token())
                    .andExpect(status().isForbidden());
        }

        @Test
        void day_9_archive_post_manager_returns_archived() throws Exception {
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("archive-manager-category"));
            PostInfo post = createPost(manager.token(), uniqueValue("archive-manager-post"), VALID_POST_BODY, category.id(), "PUBLISHED");

            MvcResult result = patchJson("/api/posts/" + post.id() + "/archive", manager.token())
                    .andExpect(status().isOk())
                    .andReturn();

            assertEquals("ARCHIVED", readJson(result).path("status").asText());
        }

        @Test
        void day_9_archive_post_user_returns_forbidden() throws Exception {
            TestUser user = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("archive-forbidden-category"));
            PostInfo post = createPost(manager.token(), uniqueValue("archive-forbidden-post"), VALID_POST_BODY, category.id(), "PUBLISHED");

            patchJson("/api/posts/" + post.id() + "/archive", user.token())
                    .andExpect(status().isForbidden());
        }

        @Test
        void day_4_delete_post_owner_returns_ok() throws Exception {
            TestUser owner = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("delete-owner-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("delete-owner-post"), VALID_POST_BODY, category.id(), "DRAFT");

            deleteJson("/api/posts/" + post.id(), owner.token())
                    .andExpect(status().isOk());
        }

        @Test
        void day_4_delete_post_admin_returns_ok() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser owner = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("delete-admin-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("delete-admin-post"), VALID_POST_BODY, category.id(), "DRAFT");

            deleteJson("/api/posts/" + post.id(), admin.token())
                    .andExpect(status().isOk());
        }

        @Test
        void day_5_delete_post_outsider_returns_forbidden() throws Exception {
            TestUser owner = registerUser();
            TestUser outsider = registerUser();
            TestUser manager = createManager();
            CategoryInfo category = createCategory(manager.token(), uniqueValue("delete-outsider-category"));
            PostInfo post = createPost(owner.token(), uniqueValue("delete-outsider-post"), VALID_POST_BODY, category.id(), "DRAFT");

            deleteJson("/api/posts/" + post.id(), outsider.token())
                    .andExpect(status().isForbidden());
        }

    }

    @Nested
    class UserControllerTests {

        @Test
                void day_4_get_all_users_admin_returns_registered_user_and_excludes_admin() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser user = registerUser();

            MvcResult result = getJson("/api/admin/users", admin.token())
                    .andExpect(status().isOk())
                    .andReturn();

                        JsonNode body = readJson(result);
                        assertTrue(arrayContainsFieldValue(body, "username", user.username()));
                        assertFalse(arrayContainsFieldValue(body, "username", ADMIN_USERNAME));
        }

        @Test
        void day_5_get_all_users_manager_returns_forbidden() throws Exception {
            TestUser manager = createManager();

            getJson("/api/admin/users", manager.token())
                    .andExpect(status().isForbidden());
        }

        @Test
        void day_4_assign_role_admin_returns_updated_roles() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser user = registerUser();

            MvcResult result = assignRole(admin.token(), user.id(), "ROLE_MANAGER")
                    .andExpect(status().isOk())
                    .andReturn();

            assertTrue(arrayContainsValue(readJson(result).path("roles"), "ROLE_MANAGER"));
        }

                @Test
                void day_11_assign_role_admin_role_returns_bad_request() throws Exception {
                        TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
                        TestUser user = registerUser();

                        assignRole(admin.token(), user.id(), "ROLE_ADMIN")
                                        .andExpect(status().isBadRequest());
                }

                @Test
                void day_11_assign_role_cannot_modify_admin_returns_bad_request() throws Exception {
                        TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);

                        assignRole(admin.token(), admin.id(), "ROLE_MANAGER")
                                        .andExpect(status().isBadRequest());
                }

        @Test
        void day_4_assign_role_invalid_payload_returns_unprocessable_entity() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser user = registerUser();

            MvcResult result = putRawJson(
                    "/api/admin/users/" + user.id() + "/role",
                    admin.token(),
                    "{}"
            ).andExpect(status().isUnprocessableEntity()).andReturn();

            assertTrue(readJson(result).path("fieldErrors").has("role"));
        }

        @Test
        void day_4_deactivate_user_admin_returns_inactive_user() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser user = registerUser();

            MvcResult result = deactivateUser(admin.token(), user.id())
                    .andExpect(status().isOk())
                    .andReturn();

            assertFalse(readJson(result).path("active").asBoolean());
        }

        @Test
        void day_11_deactivate_self_returns_bad_request() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);

            deleteJson("/api/admin/users/" + admin.id(), admin.token())
                    .andExpect(status().isBadRequest());
        }

        @Test
        void day_4_audit_logs_admin_returns_recent_entries() throws Exception {
            TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
            TestUser user = registerUser();
            assignRole(admin.token(), user.id(), "ROLE_MANAGER")
                    .andExpect(status().isOk());

            MvcResult result = getJson("/api/admin/audit-logs", admin.token())
                    .andExpect(status().isOk())
                    .andReturn();

            JsonNode logs = readJson(result);
            assertTrue(arrayContainsFieldValue(logs, "action", "ASSIGN_ROLE"));
        }

        @Test
        void day_5_audit_logs_user_returns_forbidden() throws Exception {
            TestUser user = registerUser();

            getJson("/api/admin/audit-logs", user.token())
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    class AnalyticsControllerTests {

        @Test
        void day_4_get_summary_manager_returns_counts() throws Exception {
            TestUser manager = createManager();
            JsonNode before = readJson(getJson("/api/analytics/summary", manager.token())
                    .andExpect(status().isOk())
                    .andReturn());
            CategoryInfo category = createCategory(manager.token(), uniqueValue("analytics-summary-category"));
            createPost(manager.token(), uniqueValue("analytics-summary-post"), VALID_POST_BODY, category.id(), "PUBLISHED");

            JsonNode after = readJson(getJson("/api/analytics/summary", manager.token())
                    .andExpect(status().isOk())
                    .andReturn());

            assertTrue(after.path("totalCategories").asLong() >= before.path("totalCategories").asLong() + 1);
            assertTrue(after.path("totalPosts").asLong() >= before.path("totalPosts").asLong() + 1);
            assertTrue(after.has("publishedPosts"));
            assertTrue(after.has("activeUsers"));
        }

        @Test
        void day_5_get_summary_user_returns_forbidden() throws Exception {
            TestUser user = registerUser();

            getJson("/api/analytics/summary", user.token())
                    .andExpect(status().isForbidden());
        }

        @Test
        void day_4_get_monthly_manager_returns_current_month_data() throws Exception {
            TestUser manager = createManager();
            String currentMonth = YearMonth.now().toString();
            JsonNode before = readJson(getJson("/api/analytics/monthly", manager.token())
                    .andExpect(status().isOk())
                    .andReturn());
            long previousCount = before.path(currentMonth).asLong(0L);
            CategoryInfo category = createCategory(manager.token(), uniqueValue("analytics-monthly-category"));
            createPost(manager.token(), uniqueValue("analytics-monthly-post"), VALID_POST_BODY, category.id(), "PUBLISHED");

            JsonNode after = readJson(getJson("/api/analytics/monthly", manager.token())
                    .andExpect(status().isOk())
                    .andReturn());

            assertTrue(after.path(currentMonth).asLong() >= previousCount + 1);
        }

        @Test
        void day_5_get_monthly_unauthenticated_returns_unauthorized() throws Exception {
            getJson("/api/analytics/monthly", null)
                    .andExpect(status().isUnauthorized());
        }
    }

    private TestUser registerUser() throws Exception {
        String username = uniqueValue("user");
        return registerUser(username, username + "@example.com", DEFAULT_PASSWORD);
    }

    private TestUser registerUser(String username, String email, String password) throws Exception {
        MvcResult result = postJson(
                "/api/auth/register",
                null,
                Map.of(
                        "username", username,
                        "email", email,
                        "password", password
                )
        ).andExpect(status().isCreated()).andReturn();
        return toUserSession(readJson(result));
    }

    private TestUser login(String username, String password) throws Exception {
        MvcResult result = postJson(
                "/api/auth/login",
                null,
                Map.of(
                        "username", username,
                        "password", password
                )
        ).andExpect(status().isOk()).andReturn();
        return toUserSession(readJson(result));
    }

    private TestUser createManager() throws Exception {
        TestUser admin = login(ADMIN_USERNAME, ADMIN_PASSWORD);
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        TestUser user = registerUser("manager-" + suffix, "manager-" + suffix + "@example.com", DEFAULT_PASSWORD);
        assignRole(admin.token(), user.id(), "ROLE_MANAGER")
                .andExpect(status().isOk());
        return login(user.username(), DEFAULT_PASSWORD);
    }

    private CategoryInfo createCategory(String token, String name) throws Exception {
        MvcResult result = postJson(
                "/api/categories",
                token,
                Map.of(
                        "name", name,
                        "description", name + " description"
                )
        ).andExpect(status().isCreated()).andReturn();
        JsonNode body = readJson(result);
        return new CategoryInfo(body.path("id").asLong(), body.path("name").asText());
    }

    private PostInfo createPost(String token, String title, String body, long categoryId, String statusValue) throws Exception {
        MvcResult result = postJson(
                "/api/posts",
                token,
                Map.of(
                        "title", title,
                        "body", body,
                        "categoryId", categoryId,
                        "status", statusValue
                )
        ).andExpect(status().isCreated()).andReturn();
        JsonNode response = readJson(result);
        return new PostInfo(response.path("id").asLong(), response.path("title").asText(), response.path("status").asText());
    }

    private ResultActions assignRole(String adminToken, long userId, String role) throws Exception {
        return putJson(
                "/api/admin/users/" + userId + "/role",
                adminToken,
                Map.of("role", role)
        );
    }

    private ResultActions deactivateUser(String adminToken, long userId) throws Exception {
        return deleteJson("/api/admin/users/" + userId, adminToken);
    }

    private ResultActions getJson(String url, String token) throws Exception {
        return mockMvc.perform(withAuth(get(url).accept(MediaType.APPLICATION_JSON), token));
    }

    private ResultActions postJson(String url, String token, Object payload) throws Exception {
        return mockMvc.perform(withJson(withAuth(post(url), token), payload));
    }

    private ResultActions putJson(String url, String token, Object payload) throws Exception {
        return mockMvc.perform(withJson(withAuth(put(url), token), payload));
    }

    private ResultActions putRawJson(String url, String token, String payload) throws Exception {
        return mockMvc.perform(withRawJson(withAuth(put(url), token), payload));
    }

    private ResultActions patchJson(String url, String token) throws Exception {
        return mockMvc.perform(withAuth(patch(url).accept(MediaType.APPLICATION_JSON), token));
    }

    private ResultActions deleteJson(String url, String token) throws Exception {
        return mockMvc.perform(withAuth(delete(url).accept(MediaType.APPLICATION_JSON), token));
    }

    private MockHttpServletRequestBuilder withAuth(MockHttpServletRequestBuilder builder, String token) {
        if (token != null && !token.isBlank()) {
            builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return builder;
    }

    private MockHttpServletRequestBuilder withJson(MockHttpServletRequestBuilder builder, Object payload) throws Exception {
        return builder
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload));
    }

    private MockHttpServletRequestBuilder withRawJson(MockHttpServletRequestBuilder builder, String payload) {
        return builder
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(payload);
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        String content = result.getResponse().getContentAsString();
        if (content == null || content.isBlank()) {
            return objectMapper.createObjectNode();
        }
        return objectMapper.readTree(content);
    }

    private TestUser toUserSession(JsonNode body) {
        JsonNode user = body.path("user");
        return new TestUser(
                user.path("id").asLong(),
                user.path("username").asText(),
                user.path("email").asText(),
                body.path("token").asText(),
                body.path("refreshToken").asText()
        );
    }

    private boolean arrayContainsFieldValue(JsonNode arrayNode, String fieldName, String expectedValue) {
        for (JsonNode node : arrayNode) {
            if (expectedValue.equals(node.path(fieldName).asText())) {
                return true;
            }
        }
        return false;
    }

    private boolean arrayContainsValue(JsonNode arrayNode, String expectedValue) {
        for (JsonNode node : arrayNode) {
            if (expectedValue.equals(node.asText())) {
                return true;
            }
        }
        return false;
    }

    private String uniqueValue(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private record TestUser(long id, String username, String email, String token, String refreshToken) {
    }

    private record CategoryInfo(long id, String name) {
    }

    private record PostInfo(long id, String title, String status) {
    }
}