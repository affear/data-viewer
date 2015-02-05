document.querySelector('#live-template').addEventListener('template-bound', function() {

    // HTML Elements
    var template = document.querySelector('#live-template');
    var sim_live = document.querySelector('#sim-live');
    var no_running_msg = document.querySelector('#no-running-msg');
    var paper_spinner = document.querySelector('#loader');
    var metric_dropdown = document.querySelector('#metric-dropdown');
    var fab = document.querySelector('paper-fab');

    // Color rgbs
    var cpu_color = "rgba(65, 174, 93, 1)";
    var cpu_color_transparent = "rgba(65, 174, 93, 0.2)";
    var ram_color = "rgba(62, 83, 175, 1)";
    var ram_color_transparent = "rgba(62, 83, 175, 0.2)";
    var disk_color = "rgba(244, 67, 54, 1)";
    var disk_color_transparent = "rgba(244, 67, 54, 0.2)";
    var cmps_color = "rgba(255, 191, 66, 1)";
    var cmps_color_transparent = "rgba(255, 191, 66, 0.2)";

    // Firebase root references
    var bifrost = new Firebase('https://bifrost.firebaseio.com');
    var running_ref = bifrost.child('running');
    var last_sim_id_ref = bifrost.child('last_sim_id');
    var sims_ref = bifrost.child('sims');

    // Template data-binding
    template.proxies = [];
    template.generalInfos = [];
    template.architectures = [];
    template.progress = {
        current: 0,
        max: 100
    }

    // Chart configurations
    Chart.defaults.global.animationSteps = 20;
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.maintainAspectRatio = true;
    Chart.defaults.global.scaleFontFamily = '"RobotoDraft", sans-serif';
    Chart.defaults.global.scaleOverride = true;
    Chart.defaults.global.scaleSteps = 10;
    Chart.defaults.global.scaleStepWidth = 10;
    Chart.defaults.global.scaleStartValue = 0;

    // FIREBASE: Get running value changes to start sim visualization
    running_ref.on('value', function(data) {

        var running = data.val();

        if (running) {
            console.log('Simulation is running');
            _showRunningSim();
        } else {
            console.log('No simulation is running');
            // Show no running sim message
            paper_spinner.style.display = 'none'
            sim_live.style.display = 'none';
            no_running_msg.style.display = 'flex';
        }
    });


    var _showRunningSim = function() {

        // FIREBASE: get last_sim_id value once
        last_sim_id_ref.once('value', function(data) {

            var last_sim_id = data.val();

            var last_sim_ref = bifrost.child('sims/' + last_sim_id);
            var last_sim_proxies_ref = last_sim_ref.child('proxies');

            // FIREBASE: get added proxy values
            last_sim_proxies_ref.on('child_added', function(data) {

                // Show sim
                paper_spinner.style.display = 'none'
                sim_live.style.display = 'flex';
                no_running_msg.style.display = 'none';

                var new_proxy = {
                    id: data.key(),
                    val: data.val(),
                    metrics: {
                        selected: 'r_vcpus',
                        options: [{
                            name: 'Cpu %',
                            id: 'r_vcpus'
                        }, {
                            name: 'RAM %',
                            id: 'r_memory_mb'
                        }, {
                            name: 'Disk %',
                            id: 'r_local_gb'
                        }]
                    },
                    stats: []
                }
                template.proxies.push(new_proxy);

                _update_infos(last_sim_ref, new_proxy);

                _initLineCharts();
                _initBarCharts(new_proxy.val.architecture);

                // This is shit: check when the template renders the chart
                var checkExist = setTimeout(function() {
                    var new_proxy_line_chart = document.querySelector('#line-chart' + new_proxy.id);
                    var new_proxy_bar_chart = document.querySelector('#bar-chart' + new_proxy.id);

                    if (new_proxy_line_chart && new_proxy_bar_chart) {
                        _update_chart(last_sim_id, new_proxy, new_proxy_line_chart, new_proxy_bar_chart);
                        clearInterval(checkExist);
                    }
                }, 100);

            });
        });
    }


    // Helper functions

    /*
    Updates the infos card
    */
    function _update_infos(last_sim_ref, proxy) {

        template.generalInfos = [{
            label: 'Id',
            val: 0,
            icon: 'cloud-queue'
        }, {
            label: 'Create',
            val: 0,
            icon: 'add-circle-outline'
        }, {
            label: 'Destroy',
            val: 0,
            icon: 'remove-circle-outline'
        }, {
            label: 'Resize',
            val: 0,
            icon: 'aspect-ratio'
        }, {
            label: 'Steps',
            val: 0,
            icon: 'more-horiz'
        }, {
            label: 'Start time',
            val: 0,
            icon: 'device:access-time'
        }, ]

        var no_create_ref = last_sim_ref.child('no_create');
        var no_destroy_ref = last_sim_ref.child('no_destroy');
        var no_resize_ref = last_sim_ref.child('no_resize');
        var no_steps_ref = last_sim_ref.child('steps');
        var start_ref = last_sim_ref.child('start');

        last_sim_ref.once('value', function(data) {
            template.generalInfos[0].val = data.key();
        });
        no_create_ref.on('value', function(data) {
            template.generalInfos[1].val = data.val();
            incr_progress();
        });
        no_destroy_ref.on('value', function(data) {
            template.generalInfos[2].val = data.val();
            incr_progress();
        });
        no_resize_ref.on('value', function(data) {
            template.generalInfos[3].val = data.val();
            incr_progress();
        });
        no_steps_ref.on('value', function(data) {
            template.generalInfos[4].val = data.val();
            template.progress.max = data.val();
        });
        start_ref.on('value', function(data) {
            var start_date = new Date(data.val())
            var seconds = start_date.getSeconds();
            var minutes = start_date.getMinutes();
            var hour = start_date.getHours();
            var year = start_date.getFullYear();
            var month = start_date.getMonth() + 1; // Months start with 0
            var day = start_date.getDate();
            template.generalInfos[5].val = day + "-" + month + "-" + year + " " + hour + ":" + minutes + ":" + seconds;
        });

        var incr_progress = function() {
            template.progress.current = template.generalInfos[1].val + template.generalInfos[2].val + template.generalInfos[3].val;
            console.log(template.generalInfos[1].val)
        }
    }


    function _update_stats(sim_ref, proxy, snapshot) {

        var proxy_ref = sim_ref.child('proxies/' + proxy.id);
        var aggr_no_active_cmps_ref = proxy_ref.child('snapshots/' + snapshot.id + '/aggr_no_active_cmps');
        var aggr_r_local_gb_ref = proxy_ref.child('snapshots/' + snapshot.id + '/aggr_r_local_gb');
        var aggr_r_memory_mb_ref = proxy_ref.child('snapshots/' + snapshot.id + '/aggr_r_memory_mb');
        var aggr_r_vcpus_ref = proxy_ref.child('snapshots/' + snapshot.id + '/aggr_r_vcpus');
        var no_failures_ref = proxy_ref.child('no_failures_ref');

        template.proxies[proxy.id].stats = [{
            label: 'Avg active cmps',
            val: 0,
            icon: 'dns'
        }, {
            label: 'Avg disk (GB)',
            val: 0,
            icon: 'device:data-usage'
        }, {
            label: 'Avg memory (MB)',
            val: 0,
            icon: 'hardware:memory'
        }, {
            label: 'Avg vcpus',
            val: 0,
            icon: 'hardware:memory'
        }, {
            label: 'Failures',
            val: 0,
            icon: 'error'
        }];

        aggr_no_active_cmps_ref.once('value', function(data) {
            template.proxies[proxy.id].stats[0].val = parseFloat(data.val()).toFixed(3)
        })
        aggr_r_local_gb_ref.once('value', function(data) {
            template.proxies[proxy.id].stats[1].val = parseFloat(data.val() * 100).toFixed(3);
        })
        aggr_r_memory_mb_ref.once('value', function(data) {
            template.proxies[proxy.id].stats[2].val = parseFloat(data.val() * 100).toFixed(3);
        })
        aggr_r_vcpus_ref.once('value', function(data) {
            template.proxies[proxy.id].stats[3].val = parseFloat(data.val() * 100).toFixed(3);
        })
        no_failures_ref.once('value', function(data) {
            template.proxies[proxy.id].stats[4].val = data.val() * 100;
        })
    }

    // SNAPSHOTS
    function _update_chart(last_sim_id, proxy, line_chart, bar_chart) {
        var new_proxy_snapshots_ref = sims_ref.child(last_sim_id + "/proxies/" + proxy.id + '/snapshots');
        var last_sim_ref = sims_ref.child(last_sim_id);

        // Get the runned snapshot and start to update the charts
        new_proxy_snapshots_ref.once('value', function(data) {
            // Start reading steps the last minus 10
            var no_runned_steps = data.numChildren();
            new_proxy_snapshots_ref.orderByKey().startAt((no_runned_steps - 10).toString()).on('child_added', function(data) {
                var new_snapshot = {
                    id: data.key(),
                    val: data.val(),
                }

                _update_stats(last_sim_ref, proxy, new_snapshot);

                // Get data
                var avg_r_local_gb = parseFloat(new_snapshot.val.avg_r_local_gb * 100).toFixed(3);
                var avg_r_memory_mb = parseFloat(new_snapshot.val.avg_r_memory_mb * 100).toFixed(3);;
                var avg_r_vcpus = parseFloat(new_snapshot.val.avg_r_vcpus * 100).toFixed(3);;
                var no_active_cmps = new_snapshot.val.no_active_cmps;
                var command = new_snapshot.val.command;

                // Add to the chart
                line_chart.addData([avg_r_local_gb, avg_r_memory_mb, avg_r_vcpus, no_active_cmps], new_snapshot.id + ': ' + new_snapshot.val.command);

                // BAR CHART
                var cmps = new_snapshot.val.cmps;
                var new_data = [
                    []
                ];
                for (var i = 0; i < cmps.length; i++) {
                    // Display selected metric
                    switch (template.proxies[proxy.id].metrics.selected) {
                        case "r_local_gb":
                            new_data[0].push(cmps[i].r_local_gb * 100);
                            bar_chart.changeColor(0, disk_color, disk_color_transparent);
                            break;
                        case "r_vcpus":
                            new_data[0].push(cmps[i].r_vcpus * 100);
                            bar_chart.changeColor(0, cpu_color, cpu_color_transparent);
                            break;
                        case "r_memory_mb":
                            new_data[0].push(cmps[i].r_memory_mb * 100);
                            bar_chart.changeColor(0, ram_color, ram_color_transparent);
                            break;
                    }
                };
                bar_chart.update(new_data);
            });
        })
    }


    /*
    Sets the dataset configurations for the line chart with data-binding
    */
    var _initLineCharts = function() {
        template.lineChartInitData = {
            datasets: [{
                label: "avg_r_local_gb",
                fillColor: "rgba(244, 67, 54, 0.2)",
                strokeColor: disk_color,
                pointColor: disk_color,
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: disk_color,
            }, {
                label: "avg_r_memory_mb",
                fillColor: ram_color_transparent,
                strokeColor: ram_color,
                pointColor: ram_color,
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: ram_color,
            }, {
                label: "avg_r_vcpus",
                fillColor: cpu_color_transparent,
                strokeColor: cpu_color,
                pointColor: cpu_color,
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: cpu_color,
            }, {
                label: "cmps",
                fillColor: cmps_color_transparent,
                strokeColor: cmps_color,
                pointColor: cmps_color,
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: cmps_color,
            }, ]
        };
    }

    var _initBarCharts = function(architecture) {

        template.no_cmps = architecture.length;
        template.barChartInitData = {};
        template.barChartInitData.labels = [];

        var default_data = []
        for (var i = 0; i < architecture.length; i++) {
            template.barChartInitData.labels.push(architecture[i].hostname);
            default_data.push(0);
        }
        template.barChartInitData.datasets = [{
            data: default_data,
            label: "avg_r_vcups",
            fillColor: cpu_color_transparent,
            strokeColor: cpu_color,
            pointColor: cpu_color,
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: cpu_color,
        }];
    }


});
