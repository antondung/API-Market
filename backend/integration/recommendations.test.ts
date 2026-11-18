import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import request from 'supertest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { PostgresAuthStore } from '../src/postgres-store.js';
import { AuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';
import { MarketplaceService } from '../src/marketplace-service.js';
import { BillingService } from '../src/billing-service.js';
import { RecommendationService } from '../src/recommendation-service.js';

const url = process.env.PG_TEST_URL;
if (!url) throw new Error('Run npm test to provide PostgreSQL');

async function fixture() {
  const control = new Pool({ connectionString: url });
  const schema = `rec_test_${randomUUID().replaceAll('-', '')}`;
  await control.query(`CREATE SCHEMA ${schema}`);
  const store = new PostgresAuthStore(url!, schema);
  const close = async () => {
    await store.close();
    await control.query(`DROP SCHEMA ${schema} CASCADE`);
    await control.end();
  };
  try {
    await store.migrate(true, true);
    const auth = new AuthService(store, 'recommendation-test-jwt-secret-32-bytes');
    const billing = new BillingService(store.pool, 'recommendation-sandbox-secret-32-bytes');
    const marketplace = new MarketplaceService(store.pool);
    const recommendations = new RecommendationService(store.pool, billing);
    const app = createApp(auth, () => {}, {
      marketplace,
      billing,
      recommendations,
    });
    const consumer = await auth.login('user@example.com', 'User@123');
    const admin = await auth.login('admin@example.com', 'Admin@123');
    return { store, auth, billing, recommendations, app, consumer, admin, close };
  } catch (err) {
    await close();
    throw err;
  }
}

test('Demo consumer after 14 days of Product Catalog API receives cheaper & higher-quality Commerce API deals', async () => {
  const f = await fixture();
  try {
    await request(f.app).get('/api/consumer/recommendations').expect(401);
    await request(f.app)
      .get('/api/consumer/recommendations')
      .set('Authorization', `Bearer ${f.admin.accessToken}`)
      .expect(403);

    const res = await request(f.app)
      .get('/api/consumer/recommendations')
      .set('Authorization', `Bearer ${f.consumer.accessToken}`)
      .expect(200);

    const data = res.body.data;
    assert.equal(data.usageInsights.length >= 1, true);
    const productCatalogInsight = data.usageInsights.find(
      (i: any) => i.apiName === 'Product Catalog API',
    );
    assert.ok(productCatalogInsight);
    assert.equal(productCatalogInsight.daysUsed >= 14, true);
    assert.equal(productCatalogInsight.totalRequests, 42);
    assert.equal(productCatalogInsight.meetsUsageTenureThreshold, true);

    assert.equal(data.items.length, 2);
    const names = data.items.map((item: any) => item.recommendedApi.name);
    assert.ok(names.includes('Smart Commerce Catalog Pro API'));
    assert.ok(names.includes('OmniRetail Inventory & Catalog API'));

    const smartRec = data.items.find(
      (item: any) => item.recommendedApi.name === 'Smart Commerce Catalog Pro API',
    );
    assert.equal(smartRec.comparison.hasActiveDeal, true);
    assert.equal(smartRec.comparison.originalPriceMonthly, 69000);
    assert.equal(smartRec.comparison.effectivePriceMonthly, 51750);
    assert.equal(smartRec.comparison.monthlySavingsAmount, 47250);
    assert.ok(smartRec.comparison.latencyImprovementPercent > 50);
    assert.ok(smartRec.comparison.reliabilityGainPercent > 5);
    assert.equal(smartRec.recommendedApi.providerStatus, 'Verified');

    const spec = (await request(f.app).get('/openapi.json').expect(200)).body;
    assert.ok(spec.paths['/api/consumer/recommendations'].get);
    assert.ok(spec.paths['/api/consumer/recommendations/preferences'].put);
    assert.ok(spec.paths['/api/consumer/recommendations/actions'].post);
    assert.ok(spec.paths['/api/consumer/recommendations/switch'].post);
    await SwaggerParser.validate(structuredClone(spec));
  } finally {
    await f.close();
  }
});

test('Consumer can customize preferences, save/snooze/dismiss/restore recommendations, and switch with migration options', async () => {
  const f = await fixture();
  try {
    const authHeader = { Authorization: `Bearer ${f.consumer.accessToken}` };

    // 1. Update preferences to high savings threshold (40%) -> filters out 36% OmniRetail deal, keeps 47.7% Smart Commerce
    const prefRes = await request(f.app)
      .put('/api/consumer/recommendations/preferences')
      .set(authHeader)
      .send({
        priorityMode: 'cost_saving',
        minUsageDays: 7,
        minSavingsPercent: 40,
        onlyVerifiedProviders: true,
        onlyActiveDeals: true,
        autoNotifyDeals: true,
        preferredMigrationMode: 'cancel_at_period_end',
      })
      .expect(200);
    assert.equal(prefRes.body.data.minSavingsPercent, 40);

    const filtered = (
      await request(f.app).get('/api/consumer/recommendations').set(authHeader).expect(200)
    ).body.data;
    assert.equal(filtered.items.length, 1);
    const rec = filtered.items[0];
    assert.equal(rec.recommendedApi.name, 'Smart Commerce Catalog Pro API');

    // 2. Save, dismiss with reason, verify in dismissed tab, then restore
    await request(f.app)
      .post('/api/consumer/recommendations/actions')
      .set(authHeader)
      .send({
        sourceApiId: rec.sourceApi.id,
        recommendedApiId: rec.recommendedApi.id,
        action: 'saved',
      })
      .expect(200);

    const savedList = (
      await request(f.app)
        .get('/api/consumer/recommendations?status=saved')
        .set(authHeader)
        .expect(200)
    ).body.data;
    assert.equal(savedList.items.length, 1);

    await request(f.app)
      .post('/api/consumer/recommendations/actions')
      .set(authHeader)
      .send({
        sourceApiId: rec.sourceApi.id,
        recommendedApiId: rec.recommendedApi.id,
        action: 'dismissed',
        reason: 'Wait until end of billing cycle',
      })
      .expect(200);

    const activeAfterDismiss = (
      await request(f.app).get('/api/consumer/recommendations').set(authHeader).expect(200)
    ).body.data;
    assert.equal(activeAfterDismiss.items.length, 0);

    await request(f.app)
      .post('/api/consumer/recommendations/actions')
      .set(authHeader)
      .send({
        sourceApiId: rec.sourceApi.id,
        recommendedApiId: rec.recommendedApi.id,
        action: 'restore',
      })
      .expect(200);

    const activeAfterRestore = (
      await request(f.app).get('/api/consumer/recommendations').set(authHeader).expect(200)
    ).body.data;
    assert.equal(activeAfterRestore.items.length, 1);

    // 3. Switch subscription with cancel_at_period_end
    const switchRes = await request(f.app)
      .post('/api/consumer/recommendations/switch')
      .set(authHeader)
      .send({
        sourceApiId: rec.sourceApi.id,
        recommendedApiId: rec.recommendedApi.id,
        targetPlanId: rec.recommendedPlan.id,
        migrationMode: 'cancel_at_period_end',
        sourceSubscriptionId: rec.sourceApi.currentSubscriptionId,
      })
      .expect(201);

    assert.equal(switchRes.body.data.migrationMode, 'cancel_at_period_end');
    assert.equal(switchRes.body.data.requiresCheckout, true);
    assert.equal(switchRes.body.data.newSubscription.apiId, rec.recommendedApi.id);
    assert.equal(switchRes.body.data.canceledSourceSubscription.cancelAtPeriodEnd, true);

    const switchedList = (
      await request(f.app)
        .get('/api/consumer/recommendations?status=switched')
        .set(authHeader)
        .expect(200)
    ).body.data;
    assert.equal(switchedList.items.length, 1);
  } finally {
    await f.close();
  }
});
