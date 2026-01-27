'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/app/actions/categories'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useTranslations } from '@/app/components/LocaleProvider'

export function AddCategoryDialog({
  disabled,
  trigger,
}: {
  disabled?: boolean
  trigger: React.ReactNode
}) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('categories.add')}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const res = await createCategory(formData)
            if (res?.ok) {
              setOpen(false)
              router.refresh()
            } else if (res?.error) {
              alert(t(res.error))
            }
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="cat-name">{t('categories.nameLabel')}</Label>
            <Input
              id="cat-name"
              name="name"
              required
              placeholder={t('categories.namePlaceholder')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('categories.addButton')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
