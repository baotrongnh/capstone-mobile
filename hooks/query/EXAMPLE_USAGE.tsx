// @ts-nocheck
// Ví dụ sử dụng trong Component

'use client'
import { useCreateApartment, useUpdateApartment, useDeleteApartment } from '@/hooks/query/useApartments'
import { Button, Form, Input } from 'antd'

export default function ApartmentForm({ apartmentId }: { apartmentId?: string }) {
     const [form] = Form.useForm()

     // Mutations
     const createMutation = useCreateApartment()
     const updateMutation = useUpdateApartment()
     const deleteMutation = useDeleteApartment()

     // Create
     const handleCreate = (values: string) => {
          createMutation.mutate(values, {
               onSuccess: () => {
                    form.resetFields()
                    // Navigate hoặc đóng modal
               }
          })
     }

     // Update
     const handleUpdate = (values: string) => {
          if (!apartmentId) return

          updateMutation.mutate(
               { id: apartmentId, data: values },
               {
                    onSuccess: () => {
                         // Navigate hoặc đóng modal
                    }
               }
          )
     }

     // Delete
     const handleDelete = () => {
          if (!apartmentId) return

          deleteMutation.mutate(apartmentId, {
               onSuccess: () => {
                    // Navigate về list page
               }
          })
     }

     return (
          <div>
               <Form form={form} onFinish={apartmentId ? handleUpdate : handleCreate}>
                    <Form.Item name="name" label="Tên căn hộ">
                         <Input />
                    </Form.Item>

                    <Form.Item name="price" label="Giá">
                         <Input type="number" />
                    </Form.Item>

                    <div className="flex gap-2">
                         <Button
                              type="primary"
                              htmlType="submit"
                              loading={createMutation.isPending || updateMutation.isPending}
                         >
                              {apartmentId ? 'Cập nhật' : 'Tạo mới'}
                         </Button>

                         {apartmentId && (
                              <Button
                                   danger
                                   onClick={handleDelete}
                                   loading={deleteMutation.isPending}
                              >
                                   Xóa
                              </Button>
                         )}
                    </div>
               </Form>
          </div>
     )
}
