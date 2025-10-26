"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string, label: React.ReactNode) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLabel?: React.ReactNode
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select provider")
  }
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value: controlledValue, defaultValue, onValueChange, open: controlledOpen, defaultOpen, onOpenChange, children }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
    const [selectedLabel, setSelectedLabel] = React.useState<React.ReactNode>()

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

    const handleValueChange = React.useCallback((newValue: string, label: React.ReactNode) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(newValue)
      }
      setSelectedLabel(label)
      onValueChange?.(newValue)
      if (controlledOpen === undefined) {
        setUncontrolledOpen(false)
      }
      onOpenChange?.(false)
    }, [controlledValue, onValueChange, controlledOpen, onOpenChange])

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [controlledOpen, onOpenChange])

    return (
      <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, onOpenChange: handleOpenChange, selectedLabel }}>
        <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
          <div ref={ref}>{children}</div>
        </PopoverPrimitive.Root>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

const SelectGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("py-1", className)} {...props} />
)
SelectGroup.displayName = "SelectGroup"

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder }, ref) => {
    const { selectedLabel } = useSelectContext()
    return (
      <span ref={ref} className="pointer-events-none">
        {selectedLabel || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        dir === 'rtl' ? 'text-right' : 'text-left',
        className
      )}
      dir={dir}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
    </PopoverPrimitive.Trigger>
  );
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, children, align = "start", sideOffset = 4, ...props }, ref) => {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin] w-[var(--radix-popover-trigger-width)]",
          className
        )}
        dir={dir}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useSelectContext()
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'he';
    const isSelected = selectedValue === value

    const handleClick = () => {
      onValueChange?.(value, children)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isRTL ? "pr-8 pl-2" : "pl-8 pr-2",
          isSelected && "bg-accent/50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className={cn(
          "absolute flex h-3.5 w-3.5 items-center justify-center",
          isRTL ? "right-2" : "left-2"
        )}>
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
