"use client"

import { apartmentService } from "@/lib/services/apartment.service"
import { ApartmentQueryParams } from "@/types/apartment"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// QUERIES
export const useApartments = (params?: ApartmentQueryParams) => {
  return useQuery({
    queryKey: ["apartments", params],
    queryFn: () => apartmentService.getList(params),
  })
}

export const useApartment = (id: string | number) => {
  return useQuery({
    queryKey: ["apartments", id],
    queryFn: () => apartmentService.getById(id),
    enabled: !!id,
  })
}

// MUTATIONS
export const useCreateApartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apartmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      // message.success("Tạo căn hộ thành công!");
    },
    onError: (error) => {
      // message.error(error?.message || "Có lỗi xảy ra!");
      console.log(error);
    },
  });
}

export const useUpdateApartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: string }) =>
      apartmentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      queryClient.invalidateQueries({ queryKey: ["apartments", variables.id] });
      // message.success("Cập nhật thành công!")
    },
    onError: (error) => {
      // message.error(error?.message || "Có lỗi xảy ra!");
    },
  })
}

export const useDeleteApartment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apartmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] })
      // message.success("Xóa căn hộ thành công!")
    },
    onError: (error) => {
      // message.error(error?.message || "Có lỗi xảy ra!")
    },
  })
}
