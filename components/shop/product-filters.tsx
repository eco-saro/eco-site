import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { productCategories } from "../../lib/products"

interface ProductFiltersProps {
  selectedCategory: string
  selectedSubcategory: string
  onCategoryChange: (category: string) => void
  onSubcategoryChange: (subcategory: string) => void
}

export default function ProductFilters({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}: ProductFiltersProps) {
  // Get subcategories for the selected category
  const subcategories = selectedCategory
    ? productCategories.find((cat) => cat.value === selectedCategory)?.subcategories || []
    : []

  // Function to handle category selection
  const handleCategoryChange = (category: string) => {
    if (selectedCategory === category) {
      // If clicking the already selected category, clear the filter
      onCategoryChange("")
      if (selectedSubcategory) {
        onSubcategoryChange("") // Clear subcategory when category is cleared
      }
    } else {
      // Select new category and clear subcategory
      onCategoryChange(category)
      if (selectedSubcategory) {
        onSubcategoryChange("") // Clear subcategory when changing categories
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 sm:mb-3 px-1">Categories</h3>
        <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-none overflow-y-auto pr-2 -mr-2 sm:mr-0">
          {productCategories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2 group">
              <Checkbox
                id={`category-${category.value}`}
                checked={selectedCategory === category.value}
                onCheckedChange={() => handleCategoryChange(category.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label
                htmlFor={`category-${category.value}`}
                className="flex items-center justify-between w-full text-xs sm:text-sm font-normal cursor-pointer py-1.5 group-hover:text-primary transition-colors"
              >
                <span className="truncate">{category.label}</span>
                <Badge variant="outline" className="ml-2 px-1.5 py-0.5 text-xs">
                  {category.count}
                </Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedCategory && subcategories.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm font-medium mb-2 sm:mb-3 px-1">Subcategories</h3>
          <div className="space-y-2 sm:space-y-3 max-h-[180px] sm:max-h-[240px] overflow-y-auto pr-2 -mr-2 sm:mr-0">
            {subcategories.map((subcategory) => (
              <div key={subcategory.value} className="flex items-center space-x-2 group">
                <Checkbox
                  id={`subcategory-${subcategory.value}`}
                  checked={selectedSubcategory === subcategory.value}
                  onCheckedChange={() => {
                    if (selectedSubcategory === subcategory.value) {
                      onSubcategoryChange("") // Deselect if clicked again
                    } else {
                      onSubcategoryChange(subcategory.value) // Select new subcategory
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor={`subcategory-${subcategory.value}`}
                  className="flex items-center justify-between w-full text-xs sm:text-sm font-normal cursor-pointer py-1.5 group-hover:text-primary transition-colors"
                >
                  <span className="truncate">{subcategory.label}</span>
                  <Badge variant="outline" className="ml-2 px-1.5 py-0.5 text-xs">
                    {subcategory.count}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full space-y-1">
        <AccordionItem value="price" className="border-b border-gray-100 last:border-0">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:bg-gray-50 px-2 -mx-2 rounded-md">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <div className="space-y-2 pt-1">
              {[
                { id: 'price-under-500', label: 'Under Rs 500', value: '0-500' },
                { id: 'price-500-1000', label: 'Rs 500 - Rs 1,000', value: '500-1000' },
                { id: 'price-1000-2000', label: 'Rs 1,000 - Rs 2,000', value: '1000-2000' },
                { id: 'price-2000-5000', label: 'Rs 2,000 - Rs 5,000', value: '2000-5000' },
                { id: 'price-over-5000', label: 'Over Rs 5,000', value: '5000-' },
              ].map((price) => (
                <div key={price.id} className="flex items-center space-x-2 group">
                  <Checkbox
                    id={price.id}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor={price.id}
                    className="text-xs sm:text-sm font-normal cursor-pointer py-1.5 group-hover:text-primary transition-colors"
                  >
                    {price.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ratings" className="border-b border-gray-100 last:border-0">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:bg-gray-50 px-2 -mx-2 rounded-md">
            Customer Rating
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <div className="space-y-2 pt-1">
              {[4, 3, 2, 1].map((rating) => {
                const id = `rating-${rating}-up`
                return (
                  <div key={id} className="flex items-center space-x-2 group">
                    <Checkbox
                      id={id}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-xs sm:text-sm font-normal cursor-pointer group-hover:text-primary transition-colors">
                        & Up
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-b border-gray-100 last:border-0">
          <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:bg-gray-50 px-2 -mx-2 rounded-md">
            Availability
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2 group">
                <Checkbox
                  id="in-stock"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="in-stock"
                  className="text-xs sm:text-sm font-normal cursor-pointer py-1.5 group-hover:text-primary transition-colors"
                >
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center space-x-2 group">
                <Checkbox
                  id="on-sale"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="on-sale"
                  className="text-xs sm:text-sm font-normal cursor-pointer py-1.5 group-hover:text-primary transition-colors"
                >
                  On Sale
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
