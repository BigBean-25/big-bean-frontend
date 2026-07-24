'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import apiRequest from '@/utils/api'

export default function AddMenuItem() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'coffee',
    price: '',
    original_price: '',
    image_url: '',
    ingredients: '',
    nutritional_info: '',
    allergens: '',
    preparation_time: '',
    spicy_level: 0,
    vegetarian: false,
    status: 'active',
    sort_order: 0,
    featured: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    'coffee', 'tea', 'pastries', 'sandwiches', 'desserts', 'beverages'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await apiRequest('/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        router.push('/admin/menu')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to create menu item')
      }
    } catch (error) {
      console.error('Error creating menu item:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/menu"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Menu Item</h1>
            <p className="text-gray-600">Create a new menu item</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter menu item name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Enter item description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                className="input-field"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Media</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter image URL"
            />
            <div className="mt-2">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="List ingredients"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens
              </label>
              <input
                type="text"
                name="allergens"
                value={formData.allergens}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., nuts, dairy, gluten"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time
              </label>
              <input
                type="text"
                name="preparation_time"
                value={formData.preparation_time}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., 10-15 minutes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spicy Level ({formData.spicy_level})
              </label>
              <input
                type="range"
                name="spicy_level"
                min="0"
                max="3"
                value={formData.spicy_level}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="vegetarian"
                checked={formData.vegetarian}
                onChange={handleInputChange}
                className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Vegetarian
              </span>
            </label>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Item
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/menu"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Menu Item'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
