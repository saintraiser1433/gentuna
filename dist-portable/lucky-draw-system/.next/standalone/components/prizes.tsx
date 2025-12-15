"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Gift, Edit2, Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Prize {
  id: string
  name: string
  description: string | null
  value: number | null
  position: number | null
  imageUrl: string | null
  createdAt: string
  _count?: {
    winners: number
  }
}

export function PrizesPanel() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [position, setPosition] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  // Fetch prizes
  const fetchPrizes = async () => {
    try {
      const res = await fetch("/api/prizes")
      const data = await res.json()
      setPrizes(data.prizes || [])
    } catch (error) {
      console.error("Error fetching prizes:", error)
    }
  }

  useEffect(() => {
    fetchPrizes()
  }, [])

  // Reset form
  const resetForm = () => {
    setName("")
    setDescription("")
    setValue("")
    setPosition("")
    setImageUrl("")
    setEditingId(null)
  }

  // Load prize for editing
  const handleEdit = (prize: Prize) => {
    setName(prize.name)
    setDescription(prize.description || "")
    setValue(prize.value?.toString() || "")
    setPosition(prize.position?.toString() || "")
    setImageUrl(prize.imageUrl || "")
    setEditingId(prize.id)
  }

  // Add or update prize
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const prizeData = {
        name: name.trim(),
        description: description.trim() || undefined,
        value: value ? parseFloat(value) : undefined,
        position: position ? parseInt(position) : undefined,
        imageUrl: imageUrl.trim() || undefined,
      }

      if (editingId) {
        // Update existing prize
        const res = await fetch(`/api/prizes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prizeData),
        })

        if (res.ok) {
          resetForm()
          await fetchPrizes()
        } else {
          const error = await res.json()
          alert(`Error: ${error.error}`)
        }
      } else {
        // Create new prize
        const res = await fetch("/api/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prizeData),
        })

        if (res.ok) {
          resetForm()
          await fetchPrizes()
        } else {
          const error = await res.json()
          alert(`Error: ${error.error}`)
        }
      }
    } catch (error) {
      console.error("Error saving prize:", error)
      alert("Failed to save prize")
    } finally {
      setLoading(false)
    }
  }

  // Delete prize
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return

    try {
      const res = await fetch(`/api/prizes/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchPrizes()
      }
    } catch (error) {
      console.error("Error deleting prize:", error)
      alert("Failed to delete prize")
    }
  }

  // Bulk delete prizes
  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} prize${ids.length === 1 ? '' : 's'}?`)) return

    try {
      const deletePromises = ids.map(id =>
        fetch(`/api/prizes/${id}`, { method: "DELETE" })
      )
      
      const results = await Promise.allSettled(deletePromises)
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length
      const failCount = results.length - successCount

      await fetchPrizes()
      
      if (successCount > 0) {
        alert(`${successCount} prize${successCount === 1 ? '' : 's'} deleted successfully`)
      }
      if (failCount > 0) {
        alert(`Failed to delete ${failCount} prize${failCount === 1 ? '' : 's'}`)
      }
    } catch (error) {
      console.error("Error bulk deleting prizes:", error)
      alert("Failed to delete prizes")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="size-5" />
        <h2 className="text-2xl font-bold">Prize Management</h2>
      </div>

      {/* Add/Edit Prize Form */}
      <section className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Prize" : "Add New Prize"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prizeName">Prize Name *</Label>
              <Input
                id="prizeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., First Place Trophy"
              />
            </div>
            <div>
              <Label htmlFor="prizePosition">Position (optional)</Label>
              <Input
                id="prizePosition"
                type="number"
                min="1"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g., 1 for 1st place"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="prizeDescription">Description (optional)</Label>
            <textarea
              id="prizeDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the prize..."
              className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-y"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prizeValue">Value (optional)</Label>
              <Input
                id="prizeValue"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g., 1000.00"
              />
            </div>
            <div>
              <Label htmlFor="prizeImageUrl">Image URL (optional)</Label>
              <Input
                id="prizeImageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Prize" : "Add Prize"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </section>

      {/* Prizes List */}
      <section className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">All Prizes ({prizes.length})</h3>
        <PrizesTable prizes={prizes} onEdit={handleEdit} onDelete={handleDelete} onBulkDelete={handleBulkDelete} />
      </section>
    </div>
  )
}

// Prizes Table Component
function PrizesTable({
  prizes,
  onEdit,
  onDelete,
  onBulkDelete,
}: {
  prizes: Prize[]
  onEdit: (prize: Prize) => void
  onDelete: (id: string) => void
  onBulkDelete?: (ids: string[]) => void
}) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrizes, setSelectedPrizes] = useState<Set<string>>(new Set())
  const pageSize = 10

  const filteredPrizes = prizes.filter(
    (prize) =>
      prize.name.toLowerCase().includes(search.toLowerCase()) ||
      prize.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPrizes.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPrizes = filteredPrizes.slice(startIndex, startIndex + pageSize)
  const allSelected = paginatedPrizes.length > 0 && paginatedPrizes.every(prize => selectedPrizes.has(prize.id))
  const someSelected = paginatedPrizes.some(prize => selectedPrizes.has(prize.id))

  // Reset to page 1 when search changes
  const prevSearchRef = React.useRef(search)
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      prevSearchRef.current = search
      // Use setTimeout to defer state update and avoid setState-in-effect warning
      setTimeout(() => {
        setCurrentPage(1)
      }, 0)
    }
  }, [search])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedPrizes)
      paginatedPrizes.forEach(prize => newSelected.add(prize.id))
      setSelectedPrizes(newSelected)
    } else {
      const newSelected = new Set(selectedPrizes)
      paginatedPrizes.forEach(prize => newSelected.delete(prize.id))
      setSelectedPrizes(newSelected)
    }
  }

  const handleSelectPrize = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedPrizes)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedPrizes(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedPrizes.size > 0) {
      onBulkDelete(Array.from(selectedPrizes))
      setSelectedPrizes(new Set())
    }
  }

  if (prizes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Gift className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No prizes found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search prizes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {onBulkDelete && selectedPrizes.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-medium text-red-700">
            {selectedPrizes.size} prize(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="size-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {filteredPrizes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No prizes found</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {onBulkDelete && (
                      <th className="text-left p-3 text-sm font-semibold w-12">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected && !allSelected
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="size-4 rounded border-gray-300 cursor-pointer"
                          title="Select all prizes on this page"
                        />
                      </th>
                    )}
                    <th className="text-left p-3 text-sm font-semibold">Image</th>
                    <th className="text-left p-3 text-sm font-semibold">Name</th>
                    <th className="text-left p-3 text-sm font-semibold">Description</th>
                    <th className="text-left p-3 text-sm font-semibold">Position</th>
                    <th className="text-left p-3 text-sm font-semibold">Value</th>
                    <th className="text-left p-3 text-sm font-semibold">Awarded</th>
                    <th className="text-right p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPrizes.map((prize) => (
                    <tr key={prize.id} className="border-b hover:bg-muted/30">
                      {onBulkDelete && (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedPrizes.has(prize.id)}
                            onChange={(e) => handleSelectPrize(prize.id, e.target.checked)}
                            className="size-4 rounded border-gray-300 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-3">
                        {prize.imageUrl ? (
                          <img
                            src={prize.imageUrl}
                            alt={prize.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            <Gift className="size-6 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm font-medium">{prize.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {prize.description || "-"}
                      </td>
                      <td className="p-3 text-sm">
                        {prize.position ? `#${prize.position}` : "-"}
                      </td>
                      <td className="p-3 text-sm">
                        {prize.value ? `$${prize.value.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3 text-sm">{prize._count?.winners || 0} time(s)</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(prize)}>
                            <Edit2 className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(prize.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

