import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductMovements } from './product-movements';

describe('ProductMovements', () => {
  let component: ProductMovements;
  let fixture: ComponentFixture<ProductMovements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMovements],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductMovements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
