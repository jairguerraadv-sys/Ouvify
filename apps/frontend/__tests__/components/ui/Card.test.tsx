import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Component', () => {
  it('renders Card correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className to Card', () => {
    const { container } = render(<Card className="custom-card">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-card')
  })

  it('renders CardHeader correctly', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    )
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('renders CardTitle correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders CardDescription correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Card description text')).toBeInTheDocument()
  })

  it('renders CardContent correctly', () => {
    render(
      <Card>
        <CardContent>Main content</CardContent>
      </Card>
    )
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('renders CardFooter correctly', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('renders complete Card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Test Footer')).toBeInTheDocument()
  })

  it('applies custom className to all components', () => {
    const { container } = render(
      <Card className="card-custom">
        <CardHeader className="header-custom">
          <CardTitle className="title-custom">Title</CardTitle>
          <CardDescription className="desc-custom">Desc</CardDescription>
        </CardHeader>
        <CardContent className="content-custom">Content</CardContent>
        <CardFooter className="footer-custom">Footer</CardFooter>
      </Card>
    )

    expect(container.querySelector('.card-custom')).toBeInTheDocument()
    expect(container.querySelector('.header-custom')).toBeInTheDocument()
    expect(container.querySelector('.title-custom')).toBeInTheDocument()
    expect(container.querySelector('.desc-custom')).toBeInTheDocument()
    expect(container.querySelector('.content-custom')).toBeInTheDocument()
    expect(container.querySelector('.footer-custom')).toBeInTheDocument()
  })
})
