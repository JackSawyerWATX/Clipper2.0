const request = require('supertest')
const express = require('express')

/**
 * Example Backend API Tests
 * These tests verify basic Express functionality
 */

describe('Health Check Endpoint', () => {
  let app

  beforeEach(() => {
    // Create a simple Express app for testing
    app = express()
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'API is running' })
    })
  })

  it('should return 200 status for health check', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
  })

  it('should return OK status in response', async () => {
    const response = await request(app).get('/api/health')
    expect(response.body.status).toBe('OK')
  })

  it('should have correct content type', async () => {
    const response = await request(app).get('/api/health')
    expect(response.type).toBe('application/json')
  })
})

describe('Error Handling', () => {
  let app

  beforeEach(() => {
    app = express()
    app.get('/api/test', (req, res) => {
      res.status(200).json({ success: true })
    })
  })

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/api/nonexistent')
    expect(response.status).toBe(404)
  })

  it('should return 200 for existing routes', async () => {
    const response = await request(app).get('/api/test')
    expect(response.status).toBe(200)
  })
})
