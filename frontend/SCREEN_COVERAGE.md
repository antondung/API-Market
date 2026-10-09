# Stitch screen coverage

48 màn hình nguồn có ánh xạ vào route. Các flow chính được triển khai bằng component React có state; các dashboard và showcase giữ layout nguồn với sample data. Tất cả chạy ở local demo mode.

| Screen nguồn | Route | Vai trò | Cách triển khai |
| --- | --- | --- | --- |
| api_cost_guard_notification_center_api_hub | `/app/cost-guard` | consumer | React flow + local persistence |
| api_hub_access_denied_403 | `/403` | public | Stitch layout + sample interactions |
| api_hub_admin_console | `/admin/console` | admin | Stitch layout + sample interactions |
| api_hub_admin_provider_verification_approval | `/admin/providers` | admin | React flow + local persistence |
| api_hub_admin_reports_moderation_console | `/admin/reports` | admin | React flow + local persistence |
| api_hub_admin_subscription_payment_sandbox_monitoring | `/admin/payments` | admin | Stitch layout + sample interactions |
| api_hub_admin_user_management | `/admin/users` | admin | React flow + local persistence |
| api_hub_api_review_publishing_approval_console | `/admin/reviews` | admin | React flow + local persistence |
| api_hub_authentication_session_lifecycle_ux_simulator | `/design/authentication_session_lifecycle_ux_simulator` | design | Stitch layout + sample interactions |
| api_hub_centralized_api_key_management | `/app/keys` | consumer | React flow + local persistence |
| api_hub_component_library_design_system_showcase | `/design/component_library_design_system_showcase` | design | Stitch layout + sample interactions |
| api_hub_consumer_dashboard | `/app/analytics` | consumer | Stitch layout + sample interactions |
| api_hub_consumer_dashboard_overview | `/app/overview` | consumer | Stitch layout + sample interactions |
| api_hub_create_edit_api_wizard | `/provider/apis/new` | provider | React flow + local persistence |
| api_hub_developer_api_marketplace_management_platform | `/` | public | Stitch layout + sample interactions |
| api_hub_endpoint_management | `/provider/endpoints` | provider | React flow + local persistence |
| api_hub_enterprise_admin_dashboard | `/admin/overview` | admin | Stitch layout + sample interactions |
| api_hub_enterprise_audit_logs_administrative_activity | `/admin/audit` | admin | React flow + local persistence |
| api_hub_login_post_login_redirection_experience | `/design/login_post_login_redirection_experience` | design | Stitch layout + sample interactions |
| api_hub_master_authentication_experience_security_suite | `/design/master_authentication_experience_security_suite` | design | Stitch layout + sample interactions |
| api_hub_my_apis_inventory_management | `/provider/apis` | provider | React flow + local persistence |
| api_hub_my_apis_subscriptions | `/app/subscriptions` | consumer | React flow + local persistence |
| api_hub_my_profile_account_management | `/app/profile` | consumer | React flow + local persistence |
| api_hub_openapi_import_auto_documentation_workspace | `/provider/import` | provider | React flow + local persistence |
| api_hub_pricing_plan_selection | `/pricing` | public | React flow + local persistence |
| api_hub_provider_analytics_api_health_dashboard | `/provider/analytics` | provider | Stitch layout + sample interactions |
| api_hub_provider_compliance_verification_workspace | `/provider/compliance` | provider | React flow + local persistence |
| api_hub_provider_dashboard | `/provider/overview` | provider | Stitch layout + sample interactions |
| api_hub_provider_onboarding_verification_suite | `/provider/verification` | provider | React flow + local persistence |
| api_hub_provider_pricing_plan_management | `/provider/plans` | provider | React flow + local persistence |
| api_hub_provider_subscriber_subscription_management | `/provider/subscribers` | provider | Stitch layout + sample interactions |
| api_hub_provider_workspace | `/provider/workspace` | provider | Stitch layout + sample interactions |
| api_hub_publishing_workflow_review_status_tracker | `/provider/review` | provider | React flow + local persistence |
| api_hub_registration_onboarding_lifecycle_experience | `/design/registration_onboarding_lifecycle_experience` | design | Stitch layout + sample interactions |
| api_hub_request_history | `/app/requests` | consumer | React flow + local persistence |
| api_hub_system_monitoring_api_gateway_operations | `/admin/monitoring` | admin | Stitch layout + sample interactions |
| api_hub_try_before_subscribe_experience | `/design/try_before_subscribe_experience` | design | Stitch layout + sample interactions |
| api_hub_unauthenticated_protected_route | `/protected` | public | Stitch layout + sample interactions |
| api_hub_usage_quota_monitoring | `/app/usage` | consumer | Stitch layout + sample interactions |
| api_hub_user_account_profile_settings | `/app/settings` | consumer | React flow + local persistence |
| api_hub_validation_error_handling_api_request_state_ux_library | `/design/validation_error_handling_api_request_state_ux_library` | design | Stitch layout + sample interactions |
| api_hub_visual_qa_responsive_state_refinement_showcase | `/design/visual_qa_responsive_state_refinement_showcase` | design | Stitch layout + sample interactions |
| api_marketplace_explore_apis_api_hub | `/marketplace` | public | React flow + local persistence |
| compare_apis_api_hub | `/compare` | public | React flow + local persistence |
| neural_llm_v4_api_documentation_api_hub | `/apis/neural-llm/docs` | public | React flow + local persistence |
| neural_llm_v4_api_playground_api_hub | `/apis/neural-llm/playground` | public | React flow + local persistence |
| neural_llm_v4_api_product_details_api_hub | `/apis/neural-llm` | public | React flow + local persistence |
| subscription_checkout_api_hub | `/checkout` | consumer | React flow + local persistence |

Route bổ sung: `/login`, `/register`, `/account`, `/notifications`, `/app/reports`, `/provider/revenue`, `/admin/apis`, `/admin/subscriptions`, và fallback 404.

Các source conversions nằm trong `src/screens/Screen*.tsx`; route production dùng feature overrides ở `src/App.tsx` cho các màn hình cần form, mutation và data flow thực tế của demo. Không có iframe hoặc thực thi script từ HTML nguồn.
