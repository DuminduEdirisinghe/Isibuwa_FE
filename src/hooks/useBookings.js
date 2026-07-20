import { useState, useCallback, useEffect } from 'react'
import { getBookings as apiGetBookings, approveBooking as apiApprove, rejectBooking as apiReject, checkinBooking as apiCheckin, deleteBooking as apiDelete } from '../services/api'

/**
 * useBookings — manages admin booking list state
 *
 * @returns {{
 *   bookings: array,
 *   total: number,
 *   page: number,
 *   totalPages: number,
 *   limit: number,
 *   search: string,
 *   statusFilter: string,
 *   isLoading: boolean,
 *   error: string|null,
 *   setPage: Function,
 *   setSearch: Function,
 *   setStatusFilter: Function,
 *   fetchBookings: Function,
 *   handleApprove: Function,
 *   handleReject: Function,
 *   handleCheckin: Function,
 *   handleDelete: Function,
 * }}
 */
export function useBookings() {
  const [bookings,      setBookings]      = useState([])
  const [total,         setTotal]         = useState(0)
  const [totalPages,    setTotalPages]    = useState(0)
  const [page,          setPage]          = useState(1)
  const [limit]                           = useState(20)
  const [search,        setSearchRaw]     = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [isLoading,     setIsLoading]     = useState(false)
  const [error,         setError]         = useState(null)

  const setSearch = useCallback((value) => {
    setSearchRaw(value)
    setPage(1) // Reset to page 1 on new search
  }, [])

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiGetBookings({ search, status: statusFilter, page, limit })
      const { bookings: data, total: tot, totalPages: tp } = response.data
      setBookings(data)
      setTotal(tot)
      setTotalPages(tp)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, page, limit])

  // Fetch on param change
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleApprove = useCallback(async (id) => {
    await apiApprove(id)
    await fetchBookings()
  }, [fetchBookings])

  const handleReject = useCallback(async (id) => {
    await apiReject(id)
    await fetchBookings()
  }, [fetchBookings])

  const handleCheckin = useCallback(async (id) => {
    await apiCheckin(id)
    await fetchBookings()
  }, [fetchBookings])

  const handleDelete = useCallback(async (id) => {
    await apiDelete(id)
    await fetchBookings()
  }, [fetchBookings])

  return {
    bookings,
    total,
    page,
    totalPages,
    limit,
    search,
    statusFilter,
    isLoading,
    error,
    setPage,
    setSearch,
    setStatusFilter,
    fetchBookings,
    handleApprove,
    handleReject,
    handleCheckin,
    handleDelete,
  }
}
