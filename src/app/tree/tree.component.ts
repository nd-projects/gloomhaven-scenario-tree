import { Component, OnChanges, Input, Output, EventEmitter, ViewChild, SimpleChanges, ElementRef, OnInit, OnDestroy } from '@angular/core';
import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import { SettingsService } from '../settings.service';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../material.module';


cytoscape.use(cxtmenu);

@Component({
    selector: 'app-tree',
    template: `
      <div class="tree-container">
        <div id="cy" #cy class="flex-item"></div>
        <div class="zoom-controls">
          <button mat-mini-fab color="primary" (click)="zoomIn()" matTooltip="Zoom In">
            <mat-icon>add</mat-icon>
          </button>
          <button mat-mini-fab color="primary" (click)="zoomOut()" matTooltip="Zoom Out">
            <mat-icon>remove</mat-icon>
          </button>
          <button mat-mini-fab color="accent" (click)="resetView()" matTooltip="Home View">
            <mat-icon>home</mat-icon>
          </button>
          <button mat-mini-fab color="accent" (click)="centerOnSelected()" matTooltip="Center on Selected" [disabled]="!selectedScenario">
            <mat-icon>my_location</mat-icon>
          </button>
        </div>
      </div>
    `,
    styleUrls: ['./tree.component.css'],
    standalone: true,
    imports: [MaterialModule]
})

export class TreeComponent implements OnChanges, OnInit, OnDestroy {
    @Input() elements: any;
    @Input() selectedScenario: any;
    @Output() selectScenario = new EventEmitter();
    @Output() updateScenario = new EventEmitter<any>();

    private previewMode = false;
    private settingsSubscription!: Subscription;

    @ViewChild('cy', { static: true }) cyEl!: ElementRef;
    private initialLoad = true;
    private cy: any;

    public constructor(private settingsService: SettingsService) { }

    ngOnInit() {
        this.settingsSubscription = this.settingsService.previewMode$.subscribe((value: boolean) => {
            this.previewMode = value;
            if (this.cy) {
                this.updateStyles();
            }
        });
    }

    ngOnDestroy() {
        if (this.settingsSubscription) {
            this.settingsSubscription.unsubscribe();
        }
    }

    public ngOnChanges(change: SimpleChanges): any {
        this.render();
        if (change['selectedScenario']
            && change['selectedScenario'].currentValue !== null
            && (change['selectedScenario'].currentValue.status !== 'hidden' || this.previewMode)) {
            this.panToSelected();
        }
        this.updateStyles();
    }

    public render() {
        let pan: { x: number, y: number } = { x: 0, y: 0 };
        let selectedNode: any = null;
        if (!this.initialLoad) {
            // Save current viewport pan location and selected node to re-set it after render
            pan = this.cy.pan();
            selectedNode = this.cy.nodes(':selected');
            this.cy.elements().remove();
            this.cy.add(this.elements);
        } else {
            this.cy = cytoscape(this.getCytoscapeConfig());
            this.cy.cxtmenu(this.getCxtMenuConfig());
            pan = { x: (this.cy.width() / 2), y: 50 };
            this.cy.on('tap', 'node', this.nodeClicked.bind(this));
        }
        this.cy.pan(pan);
        // Reselect previously selected node after each render
        if (selectedNode != null) {
            this.cy.$(selectedNode).select();
        }
        this.initialLoad = false;
    }

    private updateStyles() {
        this.setNodeVisibility();
        this.setEdgeVisibility();
        this.colorScenarios();
        this.checkSpecialCases();
        // selected nodes get a thick gold border with layered circular glow
        this.cy.nodes(':selected').css({
            'border-width': '4px',
            'border-color': '#f0b429',
            'border-style': 'solid',
            // Inner glow ring
            'overlay-color': '#f0b429',
            'overlay-padding': '5px',
            'overlay-opacity': 0.25,
            'overlay-shape': 'ellipse',
            // Outer glow ring (softer)
            'underlay-color': '#f0b429',
            'underlay-padding': '12px',
            'underlay-opacity': 0.08,
            'underlay-shape': 'ellipse'
        });
    }

    private setNodeVisibility() {
        this.cy.nodes().removeStyle();
        if (this.previewMode) {
            this.cy.nodes().css({
                'visibility': 'visible',
                'opacity': 1,
                'text-opacity': 1,
                'content': (ele: any) => ele.data('name')
            });
            this.cy.nodes('[status = "hidden"], [status = "locked"]').css({
                'opacity': 0.5,
                'text-opacity': 1,
                'background-color': (ele: any) => ele.data('status') === 'hidden' ? '#4a4e58' : '#607080',
                'border-style': (ele: any) => ele.data('status') === 'hidden' ? 'dashed' : 'solid'
            });
        } else {
            this.cy.nodes('[status != "hidden"]')
                .css({
                    'visibility': 'visible',
                    'opacity': 1,
                    'text-opacity': 1
                })
                .selectify();
            this.cy.nodes('[status = "hidden"]')
                .css({
                    'visibility': 'hidden',
                    'text-opacity': '0'
                });
            this.cy.nodes('[status = "locked"]').css({
                'content': (ele: any) => '#' + ele.data('id')
            });
        }
    }

    private setEdgeVisibility() {
        if (this.previewMode) {
            this.cy.edges().css({ 'visibility': 'visible' });
        } else {
            // Set edges from non-complete nodes to hidden
            this.cy.nodes('[status = "incomplete"], [status = "attempted"], [status = "hidden"], [status = "locked"]')
                .outgoers('edge')
                .css({ 'visibility': 'hidden' });
            // Set unlock edges from complete nodes to visible
            this.cy.nodes('[status = "complete"]')
                .outgoers('edge[type = "unlocks"]')
                .css({ 'visibility': 'visible' });
            // Set requiredby edges from visible nodes to visible
            this.cy.nodes('[status != "hidden"][id != 21]')
                .outgoers('edge[type = "requiredby"][target != "26"]')
                .css({ 'visibility': 'visible' });
            // Set requiredby edges from complete nodes to hidden (requirement met)
            this.cy.nodes('[status = "complete"]')
                .outgoers('edge[type = "requiredby"]')
                .css({ 'visibility': 'hidden' });
            // Set blocks edges from complete nodes to visible
            this.cy.nodes('[status = "complete"]')
                .outgoers('edge[type = "blocks"][target != "27"][target != "31"][target != "33"]')
                .css({ 'visibility': 'visible' });
            // Set blocks edges to complete nodes to hidden (completed nodes cannot be blocked)
            this.cy.nodes('[status = "complete"]')
                .incomers('edge[type = "blocks"]')
                .css({ 'visibility': 'hidden' });
            // Set edges coming into hidden nodes to be hidden (cleans up edges to nothing)
            this.cy.nodes('[status = "hidden"]')
                .incomers('edge')
                .css({ 'visibility': 'hidden' });
        }
    }

    private colorScenarios() {
        // Incomplete nodes are warm grey-brown (available)
        this.cy.nodes('[status = "incomplete"]').css({
            'color': '#f2ebd4',
            'background-color': '#7a6c5a',
            'border-width': '0px'
        });
        // Locked nodes are steel blue (known but locked)
        this.cy.nodes('[status = "locked"]').css({
            'color': '#f2ebd4',
            'background-color': '#4a6178',
            'border-width': '0px'
        });
        // Complete nodes are antique gold
        this.cy.nodes('[status = "complete"]').css({
            'color': '#c9a84c',
            'background-color': '#c9a84c',
            'border-width': '0px'
        });
        // Attempted nodes are an unfilled circle with gold border
        this.cy.nodes('[status = "attempted"]').css({
            'color': '#f2ebd4',
            'background-color': 'transparent',
            'border-color': '#c9a84c',
            'border-width': '1px'
        });

        // Scenarios blocked by other scenarios being incomplete are faded purple-grey
        this.cy.nodes('[status != "complete"][id != 21]')
            .outgoers('edge[type = "requiredby"][target != "26"]')
            .targets('node[status != "complete"]')
            .css({
                'background-color': '#504060',
                'border-width': '0px'
            });
        // Scenarios blocked by other scenarios being complete are red
        this.cy.nodes('[status = "complete"]')
            .outgoers('edge[type = "blocks"][target != "27"][target != "31"][target != "33"]')
            .targets('node[status != "complete"]')
            .css({
                'background-color': '#a53228',
                'border-width': '0px'
            });
    }

    private checkSpecialCases() {
        const scenario21Complete = this.cy.nodes('#21').data('status') === 'complete';
        const scenario24Complete = this.cy.$('#24').data('status') === 'complete';
        const scenario42Complete = this.cy.$('#42').data('status') === 'complete';
        const scenario25Complete = this.cy.$('#25').data('status') === 'complete';
        const scenario35Complete = this.cy.$('#35').data('status') === 'complete';
        const scenario23Complete = this.cy.$('#23').data('status') === 'complete';
        const scenario33Complete = this.cy.$('#33').data('status') === 'complete';
        const scenario43Complete = this.cy.$('#43').data('status') === 'complete';
        const scenario98Complete = this.cy.$("#98").data("status") === "complete";
        const scenario99Complete = this.cy.$("#99").data("status") === "complete";
        const scenario100Complete = this.cy.$("#100").data("status") === "complete";
        const scenario101Complete = this.cy.$("#101").data("status") === "complete";
        const scenario110Complete = this.cy.$("#110").data("status") === "complete";
        const scenario111Complete = this.cy.$("#111").data("status") === "complete";
        const scenario112Complete = this.cy.$("#112").data("status") === "complete";
        const scenario113Complete = this.cy.$("#113").data("status") === "complete";
        const knowledgeIsPowerCount =
            Number(scenario98Complete) +
            Number(scenario99Complete) +
            Number(scenario100Complete) +
            Number(scenario101Complete);
        const perilAvertedCount =
            Number(scenario110Complete) +
            Number(scenario111Complete) +
            Number(scenario112Complete) +
            Number(scenario113Complete);
        if (!scenario21Complete) {
            if (this.cy.nodes('#35').data('status') === 'complete') {
                if (this.cy.nodes('#27').data('status') === 'attempted' ||
                    this.cy.nodes('#27').data('status') === 'incomplete') {
                    this.cy.nodes('#35').outgoers('[type = "blocks"][target = "27"]').css({
                        'visibility': 'visible'
                    }).targets().css({
                        'background-color': '#c0392b',
                        'border-width': '0px'
                    });
                }
                if (this.cy.nodes('#31').data('status') === 'attempted' ||
                    this.cy.nodes('#31').data('status') === 'incomplete') {
                    this.cy.nodes('#35').outgoers('[type = "blocks"][target = "31"]').css({
                        'visibility': 'visible'
                    }).targets().css({
                        'background-color': '#c0392b',
                        'border-width': '0px'
                    });
                }
            }
        }
        if (!scenario24Complete || scenario42Complete) {
            if (this.cy.nodes('#34').data('status') === 'complete') {
                if (this.cy.nodes('#33').data('status') === 'attempted' ||
                    this.cy.nodes('#33').data('status') === 'incomplete') {
                    this.cy.nodes('#34').outgoers('[type = "blocks"][target = "33"]').css({
                        'visibility': 'visible'
                    }).targets().css({
                        'background-color': '#c0392b',
                        'border-width': '0px'
                    });
                }
            }
        }
        if (!scenario25Complete) {
            if (this.cy.nodes('#42').data('status') === 'complete') {
                if (this.cy.nodes('#33').data('status') === 'attempted' ||
                    this.cy.nodes('#33').data('status') === 'incomplete') {
                    this.cy.nodes('#42').outgoers('[type = "blocks"][target = "33"]').css({
                        'visibility': 'visible'
                    }).targets().css({
                        'background-color': '#c0392b',
                        'border-width': '0px'
                    });
                }
            }
        }
        if (scenario35Complete) {
            if (this.cy.nodes('#21').data('status') !== 'complete') {
                if (this.cy.nodes('#31').data('status') === 'attempted' ||
                    this.cy.nodes('#31').data('status') === 'incomplete') {
                    this.cy.nodes('#21').outgoers('[type = "requiredby"][target = "31"]').css({
                        'visibility': 'visible'
                    }).targets().css({
                        'background-color': '#504060',
                        'border-width': '0px'
                    });
                }
            }
        }
        if (!scenario23Complete && !scenario43Complete) {
            if (this.cy.nodes('#26').data('status') === 'attempted' ||
                this.cy.nodes('#26').data('status') === 'incomplete') {
                this.cy.nodes('#23, #43').outgoers('[type = "requiredby"][target = "26"]').css({
                    'visibility': 'visible',
                    'curve-style': 'unbundled-bezier',
                    'control-point-distances': '50 50 50'
                }).targets().css({
                    'background-color': '#504060',
                    'border-width': '0px'
                });
            }
        }
        if (scenario33Complete && scenario25Complete) {
            this.cy.nodes('#33').outgoers('[type = "blocks"][target = "34"]').css({
                'visibility': 'visible'
            }).targets().css({
                'background-color': '#c0392b',
                'border-width': '0px'
            });
        }
        if (knowledgeIsPowerCount > 1 && !this.previewMode) {
            this.cy
                .nodes("#98, #99, #100, #101")
                .outgoers('[type = "requiredby"]')
                .css({
                    visibility: "hidden",
                })
                .targets()
                .css({
                    "background-color": "#607080",
                    "border-width": "0px",
                });
        }
        if (perilAvertedCount > 1 && !this.previewMode) {
            this.cy
                .nodes("#110, #111, #112, #113")
                .outgoers('[type = "requiredby"]')
                .css({
                    visibility: "hidden",
                })
                .targets()
                .css({
                    "background-color": "#607080",
                    "border-width": "0px",
                });
        }
    }

    private nodeClicked(e: any) {
        const scenario = e.target;
        if (scenario.selectable()) {
            this.selectScenario.emit(scenario);
            window.setTimeout(() => this.updateStyles(), 50);
        }
    }

    private panToSelected() {
        const selectedNode = this.cy.nodes(`#${this.selectedScenario.id}`);
        this.cy.nodes().unselect();
        selectedNode.select();
        // this.colorScenarios();
        this.cy.animate({
            center: {
                eles: selectedNode
            }
        });
    }

    public zoomIn() {
        const currentZoom = this.cy.zoom();
        this.cy.zoom(currentZoom * 1.15);
    }

    public zoomOut() {
        const currentZoom = this.cy.zoom();
        this.cy.zoom(currentZoom * 0.85);
    }

    public resetView() {
        this.cy.animate({
            fit: {
                eles: this.cy.elements('[status != "hidden"]'),
                padding: 50
            }
        });
    }

    public centerOnSelected() {
        if (this.selectedScenario) {
            const selectedNode = this.cy.nodes(`#${this.selectedScenario.id}`);
            if (selectedNode.length) {
                this.cy.animate({
                    center: { eles: selectedNode }
                });
            }
        }
    }



    private getCytoscapeConfig() {
        return {
            container: this.cyEl.nativeElement,
            elements: this.elements,
            zoomingEnabled: true,
            zoom: 0.5,

            userZoomingEnabled: true,
            boxSelectionEnabled: false,
            autounselectify: false,
            autolock: true,
            layout: {
                name: 'preset'
            },
            style: (cytoscape as any).stylesheet() // Cast to any to avoid potential type issues with old style syntax
                .selector('node')
                .css({
                    'content': 'data(name)',
                    'font-size': '15px',
                    'font-weight': '600',
                    'font-family': 'Crimson Pro, serif',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'color': '#f2ebd4',
                    'text-outline-width': '3',
                    'text-outline-color': '#181a1e',
                    'text-outline-opacity': 1,
                    'background-color': '#7a6c5a',
                    'opacity': '1',
                    'border-color': '#c9a84c',
                    'border-style': 'solid'
                })
                .selector('node[status = "locked"]')
                .css({
                    'content': (ele: any) => '#' + ele.data('id')
                })
                .selector('edge')
                .css({
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#e0d8c8',
                    'line-color': '#e0d8c8',
                    'width': 2.5,
                    'opacity': 0.6
                })
                .selector('edge[type = "linksto"]')
                .css({
                    'line-style': 'dashed'
                })
                .selector('edge[type = "requiredby"]')
                .css({
                    'visibility': 'hidden',
                    'line-color': '#3e8275',
                    'target-arrow-color': '#3e8275'
                })
                .selector('edge[type = "blocks"]')
                .css({
                    'visibility': 'hidden',
                    'line-color': '#a53228',
                    'target-arrow-color': '#a53228'
                })
                .selector('node:selected')
                .css({
                    'border-width': '2px',
                    'border-color': '#d4a838'
                })
        };
    }

    private getCxtMenuConfig() {
        return {
            commands: (element: any) => {
                const data = element.data();
                return [{
                    content: 'Incomplete',
                    fillColor: data.status === 'incomplete' ? 'rgba(181, 152, 64, 0.85)' : 'rgba(32, 35, 40, 0.9)',
                    select: (ele: any) => this.cxtMenuStatusChange('incomplete', ele)
                }, {
                    content: 'Attempted',
                    fillColor: data.status === 'attempted' ? 'rgba(181, 152, 64, 0.85)' : 'rgba(32, 35, 40, 0.9)',
                    select: (ele: any) => this.cxtMenuStatusChange('attempted', ele)
                }, {
                    content: 'Complete',
                    fillColor: data.status === 'complete' ? 'rgba(181, 152, 64, 0.85)' : 'rgba(32, 35, 40, 0.9)',
                    select: (ele: any) => this.cxtMenuStatusChange('complete', ele)
                }];
            },
            activeFillColor: 'rgba(62, 130, 117, 1)'
        };
    }

    private cxtMenuStatusChange(status: string, ele: any) {
        const data = ele.data();
        const scenario = {
            id: data.id,
            status: status,
            notes: data.notes,
            treasure: data.treasure
        };
        this.updateScenario.emit(scenario);
    }

}
