import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { listProducts, type Product } from '../api'

type ProductComboboxProps = {
  value: number | undefined
  label: string | undefined
  onSelect: (product: Product) => void
  disabled?: boolean
}

export function ProductCombobox({
  value,
  label,
  onSelect,
  disabled,
}: ProductComboboxProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const { data: products = [], isFetching } = useQuery({
    queryKey: ['pos', 'produk', debouncedSearch],
    queryFn: () => listProducts(debouncedSearch),
    enabled: popoverOpen,
  })

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground'
          )}
        >
          <span className='flex items-center gap-2 truncate'>
            <Package className='size-4 shrink-0' />
            {value && label ? label : 'Pilih produk'}
          </span>
          <ChevronsUpDown className='size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Cari produk (nama / SKU)...'
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isFetching ? 'Mencari...' : 'Produk tidak ditemukan.'}
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={String(product.id)}
                  onSelect={() => {
                    onSelect(product)
                    setPopoverOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      product.id === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='flex flex-1 flex-col'>
                    <span>{product.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      Stok {product.stock} {product.unit}
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {formatCurrency(product.memberPrice ?? product.price)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
