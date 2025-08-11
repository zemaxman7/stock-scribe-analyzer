import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  stats?: {
    label: string;
    value: string;
    trend?: {
      value: string;
      isPositive: boolean;
    };
    icon: LucideIcon;
    color?: string;
  }[];
  primaryAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
  secondaryActions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  stats, 
  primaryAction, 
  secondaryActions 
}: PageHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <Card className="bg-gradient-primary shadow-glow border-0 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white font-inter">
                    {title}
                  </h1>
                  <p className="text-white/80 text-sm md:text-lg font-medium">
                    {description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {secondaryActions}
              {primaryAction && (
                <Button 
                  onClick={primaryAction.onClick}
                  size="lg" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm shadow-glow flex-1 lg:flex-none"
                  variant="outline"
                >
                  <primaryAction.icon className="h-5 w-5 mr-2" />
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-200 border-white/20"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      {stat.trend && (
                        <Badge 
                          variant="secondary"
                          className={`text-xs ${
                            stat.trend.isPositive 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {stat.trend.isPositive ? '↗' : '↘'} {stat.trend.value}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color || 'bg-primary/10'}`}>
                    <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color ? 'text-white' : 'text-primary'}`} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}