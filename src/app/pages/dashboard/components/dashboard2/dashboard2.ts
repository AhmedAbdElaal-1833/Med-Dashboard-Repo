import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StatsWidget } from '../../components/statswidget';
import { RevenueStreamWidget } from '../../components/revenuestreamwidget';
import { Revenue } from "../revenue/revenue";

@Component({
  standalone: true,
  selector: 'app-dashboard2',
  imports: [StatsWidget, RevenueStreamWidget, Revenue],
  templateUrl: './dashboard2.html',
  styleUrl: './dashboard2.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Dashboard2 {

}
