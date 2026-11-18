const bearer = [{ bearerAuth: [] }];
const idString = { type: 'string', pattern: '^[1-9][0-9]{0,9}$' };
const priorityModeEnum = ['balanced', 'cost_saving', 'high_quality', 'deals_only'];
const migrationModeEnum = ['parallel', 'cancel_at_period_end', 'immediate_cancel'];

const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
});

const commonErrors = {
  '400': errorResponse('Invalid input or query parameters'),
  '401': errorResponse('Consumer or Provider JWT required'),
  '403': errorResponse('Buyer role required'),
  '404': errorResponse('API, plan or subscription not found'),
  '409': errorResponse('Subscription state conflict'),
  '503': errorResponse('Billing service unavailable'),
};

const preferencesSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'priorityMode',
    'minUsageDays',
    'minSavingsPercent',
    'onlyVerifiedProviders',
    'onlyActiveDeals',
    'autoNotifyDeals',
    'preferredMigrationMode',
  ],
  properties: {
    priorityMode: { type: 'string', enum: priorityModeEnum },
    minUsageDays: { type: 'integer', minimum: 0, maximum: 365 },
    minSavingsPercent: { type: 'integer', minimum: 0, maximum: 95 },
    onlyVerifiedProviders: { type: 'boolean' },
    onlyActiveDeals: { type: 'boolean' },
    autoNotifyDeals: { type: 'boolean' },
    preferredMigrationMode: { type: 'string', enum: migrationModeEnum },
  },
};

const preferencesResponseSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      ...preferencesSchema,
      required: [...preferencesSchema.required, 'updatedAt'],
      properties: {
        ...preferencesSchema.properties,
        updatedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  },
};

export const recommendationPaths = {
  '/api/consumer/recommendations': {
    get: {
      tags: ['Recommendations'],
      summary: 'Get personalized API recommendations based on usage history, deals, and quality',
      description:
        'Analyzes the buyer usage tenure, latency, error rate, and subscription pricing to recommend cheaper, promotional deal, or higher-quality alternative APIs in the same category/tags.',
      security: bearer,
      parameters: [
        { name: 'sourceApiId', in: 'query', schema: idString },
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['active', 'saved', 'snoozed', 'dismissed', 'switched', 'all'], default: 'active' },
        },
        { name: 'priorityMode', in: 'query', schema: { type: 'string', enum: priorityModeEnum } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
      ],
      responses: {
        '200': {
          description: 'Personalized API recommendations and usage insights',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data'],
                properties: {
                  data: {
                    type: 'object',
                    required: ['preferences', 'summary', 'usageInsights', 'items'],
                    properties: {
                      preferences: preferencesResponseSchema.properties.data,
                      summary: {
                        type: 'object',
                        required: [
                          'totalSourceApisAnalyzed',
                          'eligibleSourceApis',
                          'totalRecommendations',
                          'activeDealsCount',
                          'potentialMonthlySavings',
                          'averageLatencyImprovementPercent',
                        ],
                        properties: {
                          totalSourceApisAnalyzed: { type: 'integer' },
                          eligibleSourceApis: { type: 'integer' },
                          totalRecommendations: { type: 'integer' },
                          activeDealsCount: { type: 'integer' },
                          potentialMonthlySavings: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                currency: { type: 'string' },
                                amount: { type: 'number' },
                              },
                            },
                          },
                          averageLatencyImprovementPercent: { type: 'number', nullable: true },
                        },
                      },
                      usageInsights: { type: 'array', items: { type: 'object' } },
                      items: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
        ...commonErrors,
      },
    },
  },
  '/api/consumer/recommendations/preferences': {
    put: {
      tags: ['Recommendations'],
      summary: 'Update personalized recommendation preferences',
      security: bearer,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: preferencesSchema,
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated recommendation preferences',
          content: {
            'application/json': {
              schema: preferencesResponseSchema,
            },
          },
        },
        ...commonErrors,
      },
    },
  },
  '/api/consumer/recommendations/actions': {
    post: {
      tags: ['Recommendations'],
      summary: 'Save, snooze, dismiss, mark switched, or restore a recommendation',
      security: bearer,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['sourceApiId', 'recommendedApiId', 'action'],
              properties: {
                sourceApiId: idString,
                recommendedApiId: idString,
                action: { type: 'string', enum: ['saved', 'snoozed', 'dismissed', 'switched', 'restore'] },
                reason: { type: 'string', minLength: 1, maxLength: 200 },
                snoozeDays: { type: 'integer', minimum: 1, maximum: 90 },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated user interaction state for the recommendation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data'],
                properties: {
                  data: {
                    type: 'object',
                    required: ['sourceApiId', 'recommendedApiId', 'userState'],
                    properties: {
                      sourceApiId: idString,
                      recommendedApiId: idString,
                      userState: {
                        type: 'object',
                        properties: {
                          action: { type: 'string', nullable: true },
                          reason: { type: 'string', nullable: true },
                          snoozedUntil: { type: 'string', format: 'date-time', nullable: true },
                          updatedAt: { type: 'string', format: 'date-time', nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...commonErrors,
      },
    },
  },
  '/api/consumer/recommendations/switch': {
    post: {
      tags: ['Recommendations'],
      summary: 'Subscribe to a recommended API and apply migration option for the source subscription',
      security: bearer,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['sourceApiId', 'recommendedApiId', 'targetPlanId'],
              properties: {
                sourceApiId: idString,
                recommendedApiId: idString,
                targetPlanId: idString,
                migrationMode: { type: 'string', enum: migrationModeEnum },
                sourceSubscriptionId: { type: 'string', pattern: '^[1-9][0-9]{0,18}$' },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Target subscription created and migration mode applied',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data'],
                properties: {
                  data: {
                    type: 'object',
                    required: ['migrationMode', 'requiresCheckout', 'newSubscription', 'canceledSourceSubscription'],
                    properties: {
                      migrationMode: { type: 'string', enum: migrationModeEnum },
                      requiresCheckout: { type: 'boolean' },
                      newSubscription: { type: 'object' },
                      canceledSourceSubscription: { type: 'object', nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
        ...commonErrors,
      },
    },
  },
};
