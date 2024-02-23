/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { Listbox, type ListboxItem } from 'libs/ui/lib/listbox/Listbox'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

import { capitalize } from '@oxide/util'

import { ErrorMessage } from './ErrorMessage'

export type ListboxFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  placeholder?: string
  className?: string
  label?: string
  required?: boolean
  description?: string | React.ReactNode | React.ReactNode
  tooltipText?: string
  control: Control<TFieldValues>
  disabled?: boolean
  items: ListboxItem[]
  onChange?: (value: string | null | undefined) => void
  isLoading?: boolean
}

export function ListboxField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  items,
  name,
  placeholder,
  label = capitalize(name),
  disabled,
  required,
  tooltipText,
  description,
  className,
  control,
  onChange,
  isLoading,
}: ListboxFieldProps<TFieldValues, TName>) {
  // TODO: recreate this logic
  //   validate: (v) => (required && !v ? `${name} is required` : undefined),
  return (
    <div className={cn('max-w-lg', className)}>
      <Controller
        name={name}
        rules={{ required }}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Listbox
              description={description}
              label={label}
              tooltipText={tooltipText}
              required={required}
              placeholder={placeholder}
              selected={field.value || null}
              items={items}
              onChange={(value) => {
                field.onChange(value)
                onChange?.(value)
              }}
              // required to get required error to trigger on blur
              // onBlur={field.onBlur}
              disabled={disabled}
              name={name}
              hasError={error !== undefined}
              isLoading={isLoading}
            />
            <ErrorMessage error={error} label={label} />
          </>
        )}
      />
    </div>
  )
}
